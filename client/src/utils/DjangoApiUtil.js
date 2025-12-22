import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const wApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1/weather",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);


// ========== AUTH UTILS ==========
export const authUtils = {
  isAuthenticated: () => !!localStorage.getItem("token"),
  
  register: async (email, password, first_name, last_name, role) => {
    const response = await api.post("user/register/", {
      email,
      password,
      first_name,
      last_name,
      role,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("user/login/", { email, password });
    return response.data;
  },

  logout: async () => {
    const token = localStorage.getItem("token");
    
    // Only try to call logout endpoint if we have a token
    if (token) {
      try {
        await api.post("user/logout/");
      } catch (err) {
        // Ignore logout errors - we're logging out anyway
        console.log("Logout endpoint error (ignored):", err.message);
      }
    }
    
    localStorage.removeItem("token");
    window.location.href = "/";
  },
};


// ========== USER API ==========
export const userApi = {
  // Get current user info
  getCurrent: async () => {
    const response = await api.get("user/current/");
    return response.data;
  },

  // Get all users (admin/team lead only)
  getAll: async () => {
    const response = await api.get("user/all/");
    return response.data;
  },

  // Get single user
  getById: async (id) => {
    const response = await api.get(`user/${id}/`);
    return response.data;
  },

  // Create user (admin only)
  create: async (data) => {
    const response = await api.post("user/all/", data);
    return response.data;
  },

  // Update user
  update: async (id, data) => {
    const response = await api.patch(`user/${id}/`, data);
    return response.data;
  },

  // Deactivate user (admin only)
  deactivate: async (id) => {
    const response = await api.delete(`user/${id}/`);
    return response.data;
  },
};


// ========== TEAM API ==========
export const teamApi = {
  // Get all teams
  getAll: async () => {
    const response = await api.get("team/");
    return response.data;
  },

  // Get single team
  getById: async (id) => {
    const response = await api.get(`team/${id}/`);
    return response.data;
  },

  // Create team (admin only)
  create: async (data) => {
    const response = await api.post("team/", data);
    return response.data;
  },

  // Update team (admin only)
  update: async (id, data) => {
    const response = await api.patch(`team/${id}/`, data);
    return response.data;
  },

  // Delete team (admin only)
  delete: async (id) => {
    const response = await api.delete(`team/${id}/`);
    return response.data;
  },

  // Get team members
  getMembers: async (teamId) => {
    const response = await api.get(`team/${teamId}/members/`);
    return response.data;
  },

  // Add member to team (admin/team lead)
  addMember: async (teamId, userId, role = "member") => {
    const response = await api.post(`team/${teamId}/members/`, {
      user_id: userId,
      role: role,
    });
    return response.data;
  },

  // Update member role (admin/team lead)
  updateMemberRole: async (membershipId, role) => {
    const response = await api.patch(`team/members/${membershipId}/`, { role });
    return response.data;
  },

  // Remove member from team (admin/team lead)
  removeMember: async (membershipId) => {
    const response = await api.delete(`team/members/${membershipId}/`);
    return response.data;
  },
};


// ========== TICKET API ==========
export const ticketApi = {
  // Get all tickets
  getAll: async () => {
    const response = await api.get("ticket/tickets/");
    return response.data;
  },

  // Get single ticket
  getById: async (id) => {
    const response = await api.get(`ticket/tickets/${id}/`);
    return response.data;
  },

  // Create ticket
  create: async (data) => {
    const response = await api.post("ticket/tickets/", data);
    return response.data;
  },

  // Update ticket
  update: async (id, data) => {
    const response = await api.patch(`ticket/tickets/${id}/`, data);
    return response.data;
  },

  // Delete ticket
  delete: async (id) => {
    const response = await api.delete(`ticket/tickets/${id}/`);
    return response.data;
  },

  // Assign ticket (admin/team lead)
  assign: async (id, data) => {
    const response = await api.patch(`ticket/tickets/${id}/assign/`, data);
    return response.data;
  },

  // Get ticket comments
  getComments: async (ticketId) => {
    const response = await api.get(`ticket/tickets/${ticketId}/comments/`);
    return response.data;
  },

  // Add comment
  addComment: async (ticketId, content) => {
    const response = await api.post(`ticket/tickets/${ticketId}/comments/`, {
      content,
    });
    return response.data;
  },

  // Update comment
  updateComment: async (commentId, content) => {
    const response = await api.patch(`ticket/comments/${commentId}/`, {
      content,
    });
    return response.data;
  },

  // Delete comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`ticket/comments/${commentId}/`);
    return response.data;
  },
};


// ========== CATEGORY API ==========
export const categoryApi = {
  // Get all categories
  getAll: async () => {
    const response = await api.get("ticket/categories/");
    return response.data;
  },

  // Get single category
  getById: async (id) => {
    const response = await api.get(`ticket/categories/${id}/`);
    return response.data;
  },

  // Create category (admin only)
  create: async (data) => {
    const response = await api.post("ticket/categories/", data);
    return response.data;
  },

  // Update category (admin only)
  update: async (id, data) => {
    const response = await api.patch(`ticket/categories/${id}/`, data);
    return response.data;
  },

  // Delete category (admin only)
  delete: async (id) => {
    const response = await api.delete(`ticket/categories/${id}/`);
    return response.data;
  },
};


// ========== WEATHER API ==========
export const weatherApi = async () => {
  let response = await wApi.get(`Las Vegas, NV/`)
  return response.data;
};