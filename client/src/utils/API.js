import axios from "axios";

export default {
    signup: userData => {
        console.log("axios createGroupNewUser");
        return axios.post(`/api/signup`, userData);
    },

    login: userData => {
        console.log("axios createGroupLogin");
        return axios.post(`/api/login`, userData);
    },

    updateLocation: userData => {
        console.log("axios updateLocation");
        return axios.put(`/api/updateLocation`, userData);
    },

    vote: voteData => {
        console.log("axios vote");
        return axios.post(`/api/vote`, voteData);
    },

    logout: (groupNum, firebaseKey, userId, votedFor) => {
        console.log("axios logging user out");
        if(!votedFor) {
            votedFor = 0;
        }
        return axios.get(`/logout/${groupNum}/${firebaseKey}/${userId}/${votedFor}`);
    }
}