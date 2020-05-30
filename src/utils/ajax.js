import axios from 'axios';
import qs from 'qs';
import config from './config';

export default {

	/**
	 * Send a Get request.
	 *
	 * @param {object} data
	 */
	get(url, urlencode=true) {
		return this.send( url, 'get', {}, urlencode);
	},

	/**
	 * Send a POST request.
	 *
	 * @param {object} data
	 */
	post(url, data, urlencode=true ) {
		return this.send(url, 'post', data, urlencode);
	},

	/**
	 * Send a PUT request.
	 *
	 * @param {object} data
	 */
	put(url, data, urlencode=true ) {
		return this.send(url, 'put', data, urlencode);
	},

	/**
	 * Send a DELETE request.
	 *
	 * @param {object} data
	 */
	delete(url, data, urlencode=true ) {
		return this.send(url, 'delete', data, urlencode);
		// Note: When sending 'params' instead of data, Axios will add ?id=177 to this.url. (If you data is {id: 177}).
		// And then if using Express you can get the params in the query (req.query.id).
	},

	send( url, requestType, data={}, urlencode=true ) {

		if ( data.length > 0 && urlencode === true) {
			data = qs.stringify(data);
		}

		return new Promise(
			( resolve, reject ) => {
				axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'; // Tell server that this is a ajax request.
				axios.defaults.baseUrl = config.baseURL;
				// const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
				// if (token) {
				// 	axios.defaults.headers['CSRF-Token'] = token;
				// }
				// axios.defaults.withCredentials = true; // Send cookie to server.
				axios[ requestType.toLowerCase() ]( url, data )
					.then(response => resolve(response.data))
					.catch(error => {
						if (error.response) {
							// The request was made and the server responded with a status code
							// that falls out of the range of 2xx
							// console.log(error.response.data);
							// console.log(error.response.status);
							// console.log(error.response.headers);

							// If server session expired then just redirect to login page.
							const status = error.response.status;
							if ( status === 401 || status === 403 || status === 419) {
								console.log('Ajax error: ', error);
								window.location.href = '/login';
								return;
							} else if (status === 422) {
								reject( {validationErrors: error.response.data.errors});
							} else {
								reject( error.response.data );
							}					
						} else if (error.request) {
						// The request was made but no response was received
						// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
						// http.ClientRequest in node.js
						console.log(error.request);
						} else {
						// Something happened in setting up the request that triggered an Error
						console.log('Error', error.message);
						}
						console.log(error.config);
						
					});
		});
	},
};
