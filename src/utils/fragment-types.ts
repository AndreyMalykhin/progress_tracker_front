/* tslint:disable */
export default {
    "__schema": {
        "types": [
            {
                "kind": "INTERFACE",
                "name": "IActivity",
                "possibleTypes": [
                    {
                        "name": "TrackableAddedActivity"
                    },
                    {
                        "name": "CounterProgressChangedActivity"
                    },
                    {
                        "name": "NumericalGoalProgressChangedActivity"
                    },
                    {
                        "name": "TaskGoalProgressChangedActivity"
                    },
                    {
                        "name": "GymExerciseEntryAddedActivity"
                    },
                    {
                        "name": "GoalApprovedActivity"
                    },
                    {
                        "name": "GoalRejectedActivity"
                    },
                    {
                        "name": "GoalAchievedActivity"
                    },
                    {
                        "name": "GoalExpiredActivity"
                    },
                    {
                        "name": "ExternalGoalReviewedActivity"
                    }
                ]
            },
            {
                "kind": "INTERFACE",
                "name": "ITrackable",
                "possibleTypes": [
                    {
                        "name": "GymExercise"
                    },
                    {
                        "name": "Counter"
                    },
                    {
                        "name": "Aggregate"
                    },
                    {
                        "name": "NumericalGoal"
                    },
                    {
                        "name": "TaskGoal"
                    }
                ]
            },
            {
                "kind": "INTERFACE",
                "name": "IPrimitiveTrackable",
                "possibleTypes": [
                    {
                        "name": "GymExercise"
                    },
                    {
                        "name": "Counter"
                    },
                    {
                        "name": "NumericalGoal"
                    },
                    {
                        "name": "TaskGoal"
                    }
                ]
            },
            {
                "kind": "INTERFACE",
                "name": "IAggregatable",
                "possibleTypes": [
                    {
                        "name": "Counter"
                    },
                    {
                        "name": "NumericalGoal"
                    },
                    {
                        "name": "TaskGoal"
                    }
                ]
            },
            {
                "kind": "INTERFACE",
                "name": "IGoal",
                "possibleTypes": [
                    {
                        "name": "NumericalGoal"
                    },
                    {
                        "name": "TaskGoal"
                    }
                ]
            },
            {
                "kind": "INTERFACE",
                "name": "ITrackableActivity",
                "possibleTypes": [
                    {
                        "name": "TrackableAddedActivity"
                    },
                    {
                        "name": "CounterProgressChangedActivity"
                    },
                    {
                        "name": "NumericalGoalProgressChangedActivity"
                    },
                    {
                        "name": "TaskGoalProgressChangedActivity"
                    },
                    {
                        "name": "GymExerciseEntryAddedActivity"
                    },
                    {
                        "name": "GoalApprovedActivity"
                    },
                    {
                        "name": "GoalRejectedActivity"
                    },
                    {
                        "name": "GoalAchievedActivity"
                    },
                    {
                        "name": "GoalExpiredActivity"
                    },
                    {
                        "name": "ExternalGoalReviewedActivity"
                    }
                ]
            }
        ]
    }
};
