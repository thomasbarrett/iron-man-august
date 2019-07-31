export default Vue.component('workout-form', {
    data: function() {
        return {
            swim: 0,
            bike: 0,
            run: 0,
        }
    },
    template: `
    <form>
        <h2>Submit Workout</h2>
        <span>I swam</span>
        <input type="number" v-model="swim" step="1"/> <span> yards! </span> <br/>
        <span>I biked</span>
        <input type="number" v-model="bike" step="any"/> <span> miles! </span> <br/>
        <span>I ran</span>
        <input type="number" v-model="run" step="any"/> <span> miles! </span> <br/>
        <button @click.prevent="$emit('submit', {swim, bike, run})">Submit</button>
    </form>`
});