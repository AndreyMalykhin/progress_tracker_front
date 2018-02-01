/* tslint:disable */
export default {
    "__schema": {
        "types": [
            {
                "kind": "INTERFACE",
                "name": "ITrackable",
                "possibleTypes": [
                    {
                        "name": "GymExercise"
                    },
                    {
                        "name": "Aggregate"
                    },
                    {
                        "name": "TaskGoal"
                    },
                    {
                        "name": "Counter"
                    },
                    {
                        "name": "NumericalGoal"
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
                        "name": "TaskGoal"
                    },
                    {
                        "name": "Counter"
                    },
                    {
                        "name": "NumericalGoal"
                    }
                ]
            },
            {
                "kind": "INTERFACE",
                "name": "IAggregatable",
                "possibleTypes": [
                    {
                        "name": "TaskGoal"
                    },
                    {
                        "name": "Counter"
                    },
                    {
                        "name": "NumericalGoal"
                    }
                ]
            },
            {
                "kind": "INTERFACE",
                "name": "IGoal",
                "possibleTypes": [
                    {
                        "name": "TaskGoal"
                    },
                    {
                        "name": "NumericalGoal"
                    }
                ]
            }
        ]
    }
};
