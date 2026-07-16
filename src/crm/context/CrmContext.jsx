import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';

const CrmContext = createContext(null);

export function CrmProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [sheetsError, setSheetsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Keep a ref of currentUser to prevent dependency loops in callbacks
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Toast helper
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Check for saved session
  useEffect(() => {
    const saved = localStorage.getItem('crm_session');
    if (saved) {
      try {
        const userObj = JSON.parse(saved);
        if (userObj) {
          if (!userObj.roles && userObj.role) {
            userObj.roles = [userObj.role];
          } else if (!userObj.roles) {
            userObj.roles = ['sales'];
          }
          setCurrentUser(userObj);
        }
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  // Fetch users from Supabase
  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('crm_users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      if (!error.message?.includes('schema cache')) {
        addToast(error.message, 'error');
      }
      return { error };
    }

    if (data) {
      const normalized = data.map(u => {
        const copy = { ...u };
        if (!copy.roles && copy.role) {
          copy.roles = [copy.role];
        } else if (!copy.roles) {
          copy.roles = ['sales'];
        }
        return copy;
      });
      setUsers(normalized);

      // Keep logged in user's profile and roles synchronized with database updates
      const current = currentUserRef.current;
      if (current) {
        const refreshedMe = normalized.find(u => u.email.toLowerCase() === current.email.toLowerCase());
        if (refreshedMe) {
          const currentStr = JSON.stringify(current);
          const refreshedStr = JSON.stringify(refreshedMe);
          if (currentStr !== refreshedStr) {
            setCurrentUser(refreshedMe);
            localStorage.setItem('crm_session', refreshedStr);
          }
        }
      }
    }
    return { data };
  }, [addToast]);

  // Fetch leads from Supabase
  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setLeads(data);
    return { data, error };
  }, []);

  // Fetch sheets from Supabase
  const fetchSheets = useCallback(async () => {
    setLoadingSheets(true);
    let query = supabase.from('crm_sheets').select('*');
    
    const current = currentUserRef.current;
    const isAdmin = current?.roles?.includes('admin');
    if (!isAdmin && current?.id) {
      query = query.or(`created_by.eq.${current.id},shared_with.cs.{${current.id}}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    setLoadingSheets(false);
    if (error) {
      const isMissingTable = 
        error.code === 'P0001' || 
        error.message?.includes('crm_sheets') ||
        error.message?.includes('does not exist') ||
        error.message?.includes('schema cache');

      if (isMissingTable) {
        setSheetsError('table_missing');
      } else {
        setSheetsError('fetch_error');
        addToast(error.message, 'error');
      }
      return { error };
    }
    setSheetsError(null);
    if (data) setSheets(data);
    return { data };
  }, [addToast]);

  // Fetch all data when logged in (only on initial login state change)
  const loggedInId = currentUser?.id;
  useEffect(() => {
    if (loggedInId) {
      fetchUsers();
      fetchLeads();
      fetchSheets();
    }
  }, [loggedInId, fetchUsers, fetchLeads, fetchSheets]);

  // Login
  const login = async (email, pin) => {
    const { data, error } = await supabase
      .from('crm_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('pin', pin)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid email or PIN' };
    }

    const sessionUser = { ...data };
    if (!sessionUser.roles && sessionUser.role) {
      sessionUser.roles = [sessionUser.role];
    } else if (!sessionUser.roles) {
      sessionUser.roles = ['sales'];
    }

    setCurrentUser(sessionUser);
    localStorage.setItem('crm_session', JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setUsers([]);
    setLeads([]);
    localStorage.removeItem('crm_session');
  };

  // ---- User CRUD ----
  const addUser = async (userData) => {
    if (!currentUser?.roles?.includes('admin')) {
      addToast('Unauthorized: Only administrators can add team members.', 'error');
      return { error: new Error('Unauthorized') };
    }

    const { data, error } = await supabase
      .from('crm_users')
      .insert([{
        name: userData.name,
        email: userData.email.toLowerCase().trim(),
        pin: userData.pin || '0000',
        roles: userData.roles || [],
      }])
      .select()
      .single();

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }
    
    await logActivity(null, 'Team Member Added', `Added ${data.name} (${data.roles.join(', ')})`);
    await fetchUsers();
    addToast(`${data.name} added to team`, 'success');
    return { data };
  };

  const updateUser = async (id, updates) => {
    if (!currentUser?.roles?.includes('admin')) {
      addToast('Unauthorized: Only administrators can modify team members or passwords.', 'error');
      return { error: new Error('Unauthorized') };
    }

    const { error } = await supabase
      .from('crm_users')
      .update(updates)
      .eq('id', id);

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    const updatedUser = users.find(u => u.id === id);
    const roleStr = updates.roles?.join(', ') || 'none';
    await logActivity(null, 'Team Member Updated', `Updated ${updatedUser?.name || 'User'} roles to [${roleStr}]`);
    await fetchUsers();
    addToast('Team member updated', 'success');
    return { success: true };
  };

  const deleteUser = async (id) => {
    if (!currentUser?.roles?.includes('admin')) {
      addToast('Unauthorized: Only administrators can deactivate team members.', 'error');
      return { error: new Error('Unauthorized') };
    }

    const deletedUser = users.find(u => u.id === id);
    const { error } = await supabase
      .from('crm_users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    await logActivity(null, 'Team Member Deactivated', `Deactivated ${deletedUser?.name || 'User'}`);
    await fetchUsers();
    addToast('Team member deactivated', 'success');
    return { success: true };
  };

  // ---- Lead CRUD ----
  const addLead = async (leadData) => {
    const { data, error } = await supabase
      .from('crm_leads')
      .insert([{
        ...leadData,
        created_by: currentUser?.id,
        status: 'new',
      }])
      .select()
      .single();

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    await logActivity(data.id, 'Lead Created', `Lead "${data.name}" was added`);
    await fetchLeads();
    addToast('Lead added successfully', 'success');
    return { data };
  };

  const addLeadsBulk = async (leadsArray) => {
    const prepared = leadsArray.map(l => ({
      ...l,
      created_by: currentUser?.id,
      status: 'new',
    }));

    const { data, error } = await supabase
      .from('crm_leads')
      .insert(prepared)
      .select();

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    // Log activity for bulk
    for (const lead of (data || [])) {
      await logActivity(lead.id, 'Lead Created', `Bulk imported`);
    }

    await fetchLeads();
    addToast(`${data?.length || 0} leads imported`, 'success');
    return { data };
  };

  const assignLead = async (leadId, userId) => {
    const assignee = users.find(u => u.id === userId);
    const { error } = await supabase
      .from('crm_leads')
      .update({ assigned_to: userId, status: 'assigned' })
      .eq('id', leadId);

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    await logActivity(leadId, 'Lead Assigned', `Assigned to ${assignee?.name || 'Unknown'}`);
    await fetchLeads();
    return { success: true };
  };

  const assignLeadsBulk = async (leadIds, userId) => {
    const assignee = users.find(u => u.id === userId);
    const { error } = await supabase
      .from('crm_leads')
      .update({ assigned_to: userId, status: 'assigned' })
      .in('id', leadIds);

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    for (const id of leadIds) {
      await logActivity(id, 'Lead Assigned', `Assigned to ${assignee?.name || 'Unknown'}`);
    }

    await fetchLeads();
    addToast(`${leadIds.length} leads assigned to ${assignee?.name}`, 'success');
    return { success: true };
  };

  const updateLeadStatus = async (leadId, status) => {
    const { error } = await supabase
      .from('crm_leads')
      .update({ status })
      .eq('id', leadId);

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    await logActivity(leadId, 'Status Changed', `Status updated to "${status}"`);
    await fetchLeads();
    return { success: true };
  };

  const updateLead = async (leadId, updates) => {
    const { error } = await supabase
      .from('crm_leads')
      .update(updates)
      .eq('id', leadId);

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    await fetchLeads();
    return { success: true };
  };

  const forwardLead = async (leadId, toUserId) => {
    const toUser = users.find(u => u.id === toUserId);
    const lead = leads.find(l => l.id === leadId);
    const isTech = toUser?.roles?.includes('technical');
    const newStatus = isTech ? 'converted' : lead?.status;

    const { error } = await supabase
      .from('crm_leads')
      .update({
        forwarded_to: toUserId,
        assigned_to: toUserId,
        status: isTech ? 'in-review' : newStatus,
      })
      .eq('id', leadId);

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    const roleStr = toUser?.roles?.join(', ') || 'user';
    await logActivity(leadId, 'Lead Forwarded', `Forwarded to ${toUser?.name} (${roleStr})`);
    await fetchLeads();
    addToast(`Lead forwarded to ${toUser?.name}`, 'success');
    return { success: true };
  };

  const closeDeal = async (leadId, pkg, requirements) => {
    const { error } = await supabase
      .from('crm_leads')
      .update({
        status: 'closed-won',
        package: pkg,
        requirements: requirements || '',
      })
      .eq('id', leadId);

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    await logActivity(leadId, 'Deal Closed', `Closed with package: ${pkg}`);
    await fetchLeads();
    addToast('Deal closed successfully! 🎉', 'success');
    return { success: true };
  };

  // ---- Activity Log ----
  const logActivity = async (leadId, action, details) => {
    await supabase.from('crm_activity_log').insert([{
      lead_id: leadId,
      user_id: currentUser?.id,
      user_name: currentUser?.name || 'System',
      action,
      details,
    }]);
  };

  const getActivityLog = async (leadId) => {
    const { data, error } = await supabase
      .from('crm_activity_log')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  };

  const fetchGlobalActivity = async () => {
    const { data, error } = await supabase
      .from('crm_activity_log')
      .select('*')
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  };

  // ---- Sheets (Spreadsheets) Operations ----
  const createSheet = async (title, customColumns = null, customRows = null) => {
    const defaultCols = [
      { id: 'col_name', label: 'Name', type: 'text' },
      { id: 'col_phone', label: 'Phone', type: 'text' },
      { id: 'col_email', label: 'Email', type: 'text' },
      { id: 'col_company', label: 'Company', type: 'text' },
      { id: 'col_city', label: 'City', type: 'text' },
      { id: 'col_status', label: 'Status', type: 'text' }
    ];
    const defaultRows = [
      { id: 'r-1', col_name: 'John Doe', col_phone: '9876543210', col_email: 'john@example.com', col_company: 'ABC Corp', col_city: 'Mumbai', col_status: 'New' }
    ];

    const columns = customColumns || defaultCols;
    const rows = customRows || defaultRows;

    const { data, error } = await supabase
      .from('crm_sheets')
      .insert([{
        title,
        columns,
        rows,
        created_by: currentUser?.id
      }])
      .select()
      .single();

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    const detailMsg = customColumns ? `Imported ${rows.length} rows` : `Created spreadsheet "${title}"`;
    await logActivity(null, 'Spreadsheet Created', detailMsg);
    await fetchSheets();
    addToast(`Spreadsheet "${title}" created`, 'success');
    return { data };
  };

  const updateSheet = async (sheetId, columns, rows) => {
    const { error } = await supabase
      .from('crm_sheets')
      .update({ columns, rows })
      .eq('id', sheetId);

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    // Update local state without full reload for instant response
    setSheets(prev => prev.map(s => s.id === sheetId ? { ...s, columns, rows } : s));
    return { success: true };
  };

  const deleteSheet = async (sheetId) => {
    const sheet = sheets.find(s => s.id === sheetId);
    const { error } = await supabase
      .from('crm_sheets')
      .delete()
      .eq('id', sheetId);

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    await logActivity(null, 'Spreadsheet Deleted', `Deleted spreadsheet "${sheet?.title || 'Unknown'}"`);
    await fetchSheets();
    addToast('Spreadsheet deleted', 'success');
    return { success: true };
  };

  const shareSheet = async (sheetId, sharedWithUserIds) => {
    const { data, error } = await supabase
      .from('crm_sheets')
      .update({ shared_with: sharedWithUserIds })
      .eq('id', sheetId)
      .select()
      .single();

    if (error) {
      addToast(error.message, 'error');
      return { error };
    }

    // Find sheet title
    const sheet = sheets.find(s => s.id === sheetId);
    const title = sheet ? sheet.title : 'Spreadsheet';
    
    // Create detailed log about who this was shared with for audit logs
    const sharedUsersNames = sharedWithUserIds.map(uid => {
      const u = users.find(user => user.id === uid);
      return u ? u.name : uid;
    }).join(', ') || 'No one';

    await logActivity(null, 'Spreadsheet Shared', `Shared "${title}" with: ${sharedUsersNames}`);
    await fetchSheets();
    addToast('Spreadsheet sharing updated successfully!', 'success');
    return { data, success: true };
  };

  // ---- Computed Stats ----
  const getStats = useCallback(() => {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const assigned = leads.filter(l => l.status === 'assigned').length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const interested = leads.filter(l => l.status === 'interested').length;
    const converted = leads.filter(l => l.status === 'converted').length;
    const inReview = leads.filter(l => l.status === 'in-review').length;
    const closedWon = leads.filter(l => l.status === 'closed-won').length;
    const closedLost = leads.filter(l => l.status === 'closed-lost').length;

    return { total, newLeads, assigned, contacted, interested, converted, inReview, closedWon, closedLost };
  }, [leads]);

  const value = {
    currentUser,
    users: users.filter(u => u.is_active),
    allUsers: users,
    leads,
    sheets,
    loadingSheets,
    sheetsError,
    loading,
    toasts,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    addLead,
    addLeadsBulk,
    assignLead,
    assignLeadsBulk,
    updateLeadStatus,
    updateLead,
    forwardLead,
    closeDeal,
    logActivity,
    logCrmActivity: logActivity,
    getActivityLog,
    fetchGlobalActivity,
    getStats,
    fetchLeads,
    fetchUsers,
    fetchSheets,
    createSheet,
    updateSheet,
    deleteSheet,
    shareSheet,
    addToast,
  };

  return (
    <CrmContext.Provider value={value}>
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used within CrmProvider');
  return ctx;
}
