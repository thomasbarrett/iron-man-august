import { whoami, stats, createWorkout, logout, everyone, statistics, workouts, deleteWorkout} from './api.js'
import WorkoutForm from './WorkoutForm.js'

export default Vue.component('main-page', {
    data: function() {
        return {
            userLoaded: false,
            user: null,
            statsLoaded: false,
            stats: null,
            leaderboard: [],
            workouts: []
        }
    },
    mounted: function() {
        whoami().then(data => {
            this.user = data.user;
            this.userLoaded = true;
        }).catch(error => {
            console.log(error);
        });

        this.loadStats();
        this.loadWorkouts();
        this.loadLeaderboard();
    },
    methods: {
        handleCreateWorkout: function(workout) {
            createWorkout(workout).then(result => {
                this.loadStats();
                this.loadWorkouts();
                this.loadLeaderboard();
            });
        },
        loadStats: function() {
            stats().then(data => {
                this.stats = data.stats;
                this.statsLoaded = true;
            }).catch(error => {
                console.log(error);
            });
        },
        loadWorkouts: function() {
            workouts().then(data => {
                console.log(data);
                this.workouts = data.workouts;
            }).catch(error => {
                console.log(error);
            });
        },
        loadLeaderboard: function() {
            this.leaderboard = [];
            everyone().then(result => {
                result.everyone.forEach(person => {
                    statistics(person).then(result => {
                        this.leaderboard.push({
                            name: person.username,
                            ...result.stats
                        })
                    });
                })
            }).catch(error => {
                console.log(error);
            });
        },
        handleLogout: function() {
            logout();
            window.location.reload();
        },
        handleDeleteWorkout(workout) {
            deleteWorkout(workout).then(result => {
                this.loadWorkouts();
                this.loadStats();
                this.loadLeaderboard();
            });
        }
    },
    template: `
    <div v-if="userLoaded">
        <header style="display: flex; justify-content: space-between; padding: 10px; align-items: center;">
            <h1>{{ user.username }}</h1>
            <button @click="handleLogout">Logout</button>
        </header>
        <div>
            <div class="stats-container" v-if="statsLoaded">
                <h2>Statistics</h2>
                <p>You have swam {{ stats.swim }} yards ({{ (stats.swim / 4224 * 100).toFixed(2) }}%)</p>
                <p>You have biked {{ stats.bike }} miles ({{ (stats.bike / 112 * 100).toFixed(2) }}%) </p>
                <p>You have ran {{ stats.run }} miles ({{ (stats.run / 26.22 * 100).toFixed(2) }}%) </p>
            </div>
            <workout-form class="stats-container" @submit="handleCreateWorkout"></workout-form>
            <div class="stats-container">
                <h2>Leaderboard</h2>
                <table style="display: block;">
                    <tr>
                        <th>Username</th>
                        <th>Swim</th> 
                        <th>Run</th>
                        <th>Bike</th>
                    </tr>
                    <tr v-for="person in leaderboard">
                        <td>{{ person.name }}</td>
                        <td>{{ person.swim }}</td> 
                        <td>{{ person.bike }}</td>
                        <td>{{ person.run }}</td>
                    </tr>
                </table>
            </div>
            <div class="stats-container">
                <h2>Workouts</h2>
                
                <table v-if="workouts.length != 0"style="display: block;">
                <tr>
                    <th>Swim</th> 
                    <th>Run</th>
                    <th>Bike</th>
                </tr>
                <tr v-for="workout in workouts">
                    <td>{{ workout.swim }}</td> 
                    <td>{{ workout.bike }}</td>
                    <td>{{ workout.run }}</td>
                    <button @click="handleDeleteWorkout(workout)">Delete</button>
                </tr>
                
            </table>
            <div v-else>
                <p style="color: #aaaaaa; text-align: center; margin: 40px 0;">You don't have any workouts</p>
            </div>
            </div>
        </div>
    </div>`
});