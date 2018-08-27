import axios from "axios";

export default {

    // --- I know I'm using these
    signup: userData => {
        console.log("Axios createGroupNewUser");
        return axios.post("/api/signup", userData);
    },

    login: userData => {
        console.log("Axios createGroupLogin");
        return axios.post("/api/login", userData);
    },

    updateLocation: userData => {
        console.log("Axios updateLocation");
        return axios.put("/api/updateLocation", userData);
    },

    logout: () => {
        console.log("Axios logging user out");
        return axios.get("/logout");
    },


    // --- Not sure if I'm still using these
    createUser: (userData) => {
        console.log("Axios createUser");
        return axios.post("/api/create_user", userData);
    },

    userData: () => {
        console.log("Axios userData");
        return axios.get("/api/user_data");
    },

    checkUrl: (data) => {
        console.log("Axios checkUrl");
        return axios.post("/api/check_url", data);
    }
}