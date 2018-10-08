import axios from "axios";

export default {

    signup: userData => {
        console.log("Axios createGroupNewUser");
        return axios.post(`/api/signup`, userData);
    },

    login: userData => {
        console.log("Axios createGroupLogin");
        return axios.post(`/api/login`, userData);
    },

    updateLocation: userData => {
        console.log("Axios updateLocation");
        return axios.put(`/api/updateLocation`, userData);
    },

    logout: (groupNum, firebaseKey, userId) => {
        console.log("Axios logging user out");
        return axios.get(`/logout/${groupNum}/${firebaseKey}/${userId}`);
    }
}