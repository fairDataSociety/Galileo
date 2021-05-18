export default class FairOS {
    apiUrl;

    constructor(apiUrl = 'http://localhost:9090/v1/') {
        this.apiUrl = apiUrl;
    }

    api(method, url, formData = {} | FormData) {
        const postData = method === 'POST' ? {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            // todo check is work if received formData as obect
            body: JSON.stringify(Object.fromEntries(formData)),
            credentials: 'include'
        } : {
            method: method,
            credentials: 'include'
        };

        return fetch(url, postData)
            .then(data => data.json());
    }

    isUserLoggedIn(username) {
        return this.api('GET', `${this.apiUrl}user/isloggedin?user=${username}`);
    }

    login(username, password) {
        let formData = new FormData();
        formData.append('user_name', username);
        formData.append('password', password);
        return this.api('POST', `${this.apiUrl}user/login`, formData);
    }

    signup(username, password, mnemonic) {
        let formData = new FormData();
        formData.append('user_name', username);
        formData.append('password', password);
        formData.append('mnemonic', mnemonic);
        return this.api('POST', `${this.apiUrl}user/signup`, formData);
    }

    podOpen(pod, password) {
        let formData = new FormData();
        formData.append('pod_name', pod);
        formData.append('password', password);
        return this.api('POST', `${this.apiUrl}pod/open`, formData);
    }

    podReceive(reference) {
        // let formData = new FormData();
        // formData.append('sharing_ref', reference);
        // formData.append('pod_name', "7777");
        return this.api('GET', `${this.apiUrl}pod/receive?sharing_ref=${reference}`);
    }

    kvOpen(name) {
        let formData = new FormData();
        formData.append('table_name', name);
        return this.api('POST', `${this.apiUrl}kv/open`, formData);
    }
}
