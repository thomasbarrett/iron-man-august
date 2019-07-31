import { authenticate, createAccount } from './api.js'

Vue.component('login-form', {
  data: function () {
    return {
      username: '',
      password: '',
      message: '',
    }
  },
  methods: {
    onSubmit: function() {
      authenticate(this.username, this.password).then(result => {
        window.location.reload();
      }).catch(error => {
        this.message = error.message;
      });
    }
  },
  template: `
  <div>
    <div class='login-border'>
      <h1>Login</h1>
      <form>
        <input type="text" v-model="username" placeholder="username"/><br>
        <input type="password" v-model="password" placeholder="password"/><br/>
        <button @click.prevent="onSubmit">Submit</button>
        <p>{{ this.message }}</p>
      </form>
    </div>
    <p>Don't already have an account? <a v-on:click='$emit("toggle-login")' href="#">Create Account</a></p>
  </div>
  `
});

Vue.component('create-account-form', {
  data: function () {
    return {
      username: '',
      password: '',
      email: '',
      message: ' ',
    }
  },
  methods: {
    onSubmit: function() {
      createAccount(this.username, this.password, this.email).then(result => {
        window.location.reload();
      }).catch(error => {
        this.message = error.message;
      });
    }
  },
  template: `
  <div>
    <div class='login-border'>
      <h1>Create Account</h1>
      <form>
        <input type="text" v-model="username" placeholder="username"/><br>
        <input type="password" v-model="password" placeholder="password"/><br/>
        <input type="text" v-model="email" placeholder="email"/><br>
        <button @click.prevent="onSubmit">Submit</button>
        <p>{{ this.message }}</p>
      </form>
    </div>
    <p>Already have an account? <a v-on:click='$emit("toggle-login")' href="#">Login</a></p>
  </div>
  `
});

export default Vue.component('login-page', {
  data: function() {
    return {
      toggleLogin: true
    }
  },
  computed: {
    displayed: function() {
      return this.toggleLogin ? 'login-form': 'create-account-form';
    }
  },
  methods: {
    handleToggleLogin() {
      this.toggleLogin = !this.toggleLogin;
    }
  },
  template: `
  <div class='login-container'>
      <component v-on:toggle-login='handleToggleLogin()' v-bind:is='displayed'></component>
  </div>
  `
});
