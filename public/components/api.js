import { store } from './store.js'

const api = {
  get: function(method) {
    return fetch(`${store.url}/api/${method}`, {
      headers: {
        'Accept': 'application/json',
      },
    }).then(response => {
      if (response.status === 200) {
        return response.json(); 
      } else {
        return Promise.reject({ message: `status code: ${response.status}` });
      }
    }).then(data => {
      if (data.success) {
        return data; 
      } else {
        return Promise.reject({ message: data.message });
      }
    });
  },
  post: function(method, params) {
    return fetch(`${store.url}/api/${method}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params)
    }).then(response => {
      if (response.status === 200) {
        return response.json(); 
      } else {
        return Promise.reject({ message: `status code: ${response.status}` });
      }
    }).then(data => {
      if (data.success) {
        return data; 
      } else {
        return Promise.reject({ message: data.message });
      }
    });
  },
  delete: function(method) {
    return fetch(`${store.url}/api/${method}`, {
      method: 'delete',
      headers: {
        'Accept': 'application/json',
      },
    }).then(response => {
      if (response.status === 200) {
        return response.json(); 
      } else {
        return Promise.reject({ message: `status code: ${response.status}` });
      }
    }).then(data => {
      if (data.success) {
        return data; 
      } else {
        return Promise.reject({ message: data.message });
      }
    });
  }
}

function authenticate(username, password) {
  return api.post('authenticate', {username, password});
}

function createAccount(username, password, email) {
  return api.post('createAccount', {username, password, email});
}

function logout() {
  return api.post('logout');
}

function whoami() {
  return api.get('whoami');
}

function stats() {
  return api.get('stats');
}

function everyone() {
  return api.get('everyone');
}

function statistics(person) {
  return api.get(`stats/${person._id}`);
}

function workouts() {
  return api.get('workouts');
}


function deleteWorkout(workout) {
  return api.delete(`workouts/${workout._id}`);
}

function createWorkout(workout) {
  return api.post('workouts', {
    time: Date.now(),
    swim: parseFloat(workout.swim),
    bike: parseFloat(workout.bike),
    run: parseFloat(workout.run),
  });
}




export {authenticate, createAccount, whoami, logout, everyone, workouts, deleteWorkout, statistics, stats, createWorkout};