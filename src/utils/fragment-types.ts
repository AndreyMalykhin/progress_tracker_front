/* tslint:disable */
export default {
    "__schema": {
        "types": [
            {
                "kind": "INTERFACE",
                "name": "ITrackable",
                "possibleTypes": [
                    {
                        "name": "NumericalGoal"
                    },
                    {
                        "name": "Aggregate"
                    },
                    {
                        "name": "TaskGoal"
                    },
                    {
                        "name": "GymExercise"
                    },
                    {
                        "name": "Counter"
                    }
                ]
            },
            {
                "kind": "INTERFACE",
                "name": "IPrimitiveTrackable",
                "possibleTypes": [
                    {
                        "name": "NumericalGoal"
                    },
                    {
                        "name": "TaskGoal"
                    },
                    {
                        "name": "GymExercise"
                    },
                    {
                        "name": "Counter"
                    }
                ]
            },
            {
                "kind": "INTERFACE",
                "name": "IAggregatable",
                "possibleTypes": [
                    {
                        "name": "NumericalGoal"
                    },
                    {
                        "name": "TaskGoal"
                    },
                    {
                        "name": "Counter"
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
            }
        ]
    }
};
