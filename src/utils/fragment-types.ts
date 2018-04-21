/* tslint:disable */
export default {
    "__schema": {
        "types": [
            {
                "kind": "INTERFACE",
                "name": "IActivity",
                "possibleTypes": [
                    {
                        "name": "ExternalGoalReviewedActivity"
                    },
                    {
                        "name": "GoalAchievedActivity"
                    },
                    {
                        "name": "GoalRejectedActivity"
                    },
                    {
                        "name": "GoalApprovedActivity"
                    },
                    {
                        "name": "GymExerciseEntryAddedActivity"
                    },
                    {
                        "name": "TaskGoalProgressChangedActivity"
                    },
                    {
                        "name": "NumericalGoalProgressChangedActivity"
                    },
                    {
                        "name": "CounterProgressChangedActivity"
                    },
                    {
                        "name": "TrackableAddedActivity"
                    }
                ]
            },
            {
                "kind": "INTERFACE",
                "name": "ITrackable",
                "possibleTypes": [
                    {
                        "name": "Aggregate"
                    },
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
                        "name": "ExternalGoalReviewedActivity"
                    },
                    {
                        "name": "GoalAchievedActivity"
                    },
                    {
                        "name": "GoalRejectedActivity"
                    },
                    {
                        "name": "GoalApprovedActivity"
                    },
                    {
                        "name": "GymExerciseEntryAddedActivity"
                    },
                    {
                        "name": "TaskGoalProgressChangedActivity"
                    },
                    {
                        "name": "NumericalGoalProgressChangedActivity"
                    },
                    {
                        "name": "CounterProgressChangedActivity"
                    },
                    {
                        "name": "TrackableAddedActivity"
                    }
                ]
            }
        ]
    }
};
