import axios from "axios";
//Marcos Escobar
const api = axios.create({
    baseURL: "/api",
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            const mensaje = error.response?.data?.message || "Tu sesión ha expirado";
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            if (window.location.pathname !== "/login") {
                localStorage.setItem("sesion_expirada_msg", mensaje);
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    },
);

export default api;
