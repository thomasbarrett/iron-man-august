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
                this.workouts = data.workouts;
            }).catch(error => {
                console.log(error);
            });
        },
        completionPercentage: function(person) {
            return (0.2 * Math.min(person.swim / 4000, 1.0))
            + (0.5 * Math.min(person.bike / 112, 1.0))
            + (0.3 * Math.min(person.run / 26.22, 1.0));
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
                        this.leaderboard.sort((a, b) => {
                            return this.completionPercentage(a) - this.completionPercentage(b);
                        }).reverse();
                    });
                })                
            }).catch(error => {
                console.log(error);
            });
        },
        handleLogout: function() {
            logout().then(result => {
                window.location.reload();
            });
        },
        handleDeleteWorkout(workout) {
            console.log('workout deleted')
            deleteWorkout(workout).then(result => {
                this.loadWorkouts();
                this.loadStats();
                this.loadLeaderboard();
            });
        },
        datestring(time) {
           let date = new Date(time);
           let mm = date.getMonth() + 1; // getMonth() is zero-based
           let dd = date.getDate();
           return [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('-');
         
        }
    },
    computed: {
        swimPercentage: function() {
            return Math.min(this.stats.swim / 4000, 1) * 100;
        },
        bikePercentage: function() {
            return Math.min(this.stats.bike / 112, 1) * 100;
        },
        runPercentage: function() {
            return Math.min(this.stats.run / 26.22, 1) * 100;
        }
    },
    template: `
    <div v-if="userLoaded">
        <header style="display: flex; justify-content: space-between; padding: 10px; align-items: center;">
            <span style="display:flex; align-items: center; font-size: 1.5em;">
                <i class="fas fa-running"></i>
                <span style="margin-left: 10px">Ironman<b>August</b></span>
            </span>
            <button @click="handleLogout">logout</button>
        </header>
        <div>
            <div class="stats-container" v-if="statsLoaded">
                <h2>Progress</h2>
                <div class='progress-bar'>
                    <div class="blue" v-bind:style="{ width: swimPercentage + '%' }""></div>
                </div>
                <div class='progress-bar'>
                    <div class="yellow" v-bind:style="{ width: bikePercentage + '%' }"></div>
                </div>
                <div class='progress-bar'>
                    <div class="red" v-bind:style="{ width: runPercentage + '%' }"></div>
                </div>
                <div style = "display: flex; justify-content: space-around; margin: 20px 0;">
                    <div><i class="fas fa-swimmer"></i><span style="margin-left: 10px">{{ stats.swim }} yards</span></div>
                    <div><i class="fas fa-biking"></i><span style="margin-left: 10px">{{ stats.bike }} miles</span></div>
                    <div><i class="fas fa-running"></i><span style="margin-left: 10px">{{ stats.run }} miles</span></div>
                </div>
            </div>
            <workout-form class="stats-container" @submit="handleCreateWorkout"></workout-form>

            <div class="stats-container">
                <h2>Workouts</h2>
                
                <table v-if="workouts.length != 0">
                    <tr>
                        <th>
                        <th>Date</th>
                        <th>Swim</th> 
                        <th>Bike</th>
                        <th>Run</th>
                    </tr>
                    <tr v-for="workout in workouts">
                        <td @click="handleDeleteWorkout(workout)"><i class="fa fa-trash" aria-hidden="true"></i></td>
                        <td>{{ datestring(workout.time) }} </td>
                        <td>{{ workout.swim }}</td> 
                        <td>{{ workout.bike }}</td>
                        <td>{{ workout.run }}</td>
                    </tr>
                </table>
                <div v-else>
                    <p style="color: #aaaaaa; text-align: center; margin: 40px 0;">You don't have any workouts</p>
                </div>
            </div>

            <div class="stats-container leaderboard">
                <h2>Leaderboard</h2>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Username</th>
                            <th>Swim</th> 
                            <th>Bike</th>
                            <th>Run</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(person, index) in leaderboard" :key="person.name">
                            <td v-if="index == 0"><i class="fas fa-medal" style="color: gold"></i></td>
                            <td v-else-if="index == 1"><i class="fas fa-medal"  style="color: silver"></i></td>
                            <td v-else-if="index == 2"><i class="fas fa-medal"  style="color: #cd7f32"></i></td>
                            <td v-else>{{ index + 1 }}</td>

                            <td>{{ person.name }}</td>
                            <td>{{ person.swim }}</td> 
                            <td>{{ person.bike }}</td>
                            <td>{{ person.run }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
        </div>
    </div>`
});