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
            }
        ]
    }
};
