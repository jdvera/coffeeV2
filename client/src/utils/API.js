import axios from "axios";

export default {
    createGroup: (groupData) => {
        console.log("Axios createGroup");
        return axios.post("/api/create_group", groupData);
    },

    createUser: (userData) => {
        console.log("Axios createUser");
        return axios.post("/api/create_user", userData);
    },

    logout: () => {
        console.log("Axios logging group out");
        return axios.get("/logout");
    },

    userData: () => {
        console.log("Axios userData");
        return axios.get("/api/user_data");
    },

    // getInfo: () => {
    //     console.log("Axios getInfo");
    //     return axios.get("/api/get_info")
    // },

    checkUrl: (data) => {
        console.log("Axios checkUrl");
        return axios.post("/api/check_url", data);
    }
}