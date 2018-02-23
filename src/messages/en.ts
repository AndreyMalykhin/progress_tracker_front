export default {
    "activities.counterProgressChanged":
        "Increased counter {trackableTitle} by {delta}",
    "activities.externalGoalReviewed":
        `{isApprove, select,
            true {Approved}
            false {Rejected}
        } {userName}'s goal {trackableTitle}{hasRatingDelta, select,
            true {, gained {ratingDelta} rating}
            false {}
        }`,
    "activities.goalAchieved": "Achieved goal {trackableTitle}",
    "activities.goalApproved":
        `Goal {trackableTitle} approved{hasRatingDelta, select,
            true {, gained {ratingDelta} rating}
            false {}
        }`,
    "activities.goalExpired": "Goal {trackableTitle} expired",
    "activities.goalRejected": "Goal {trackableTitle} rejected",
    "activities.gymExerciseEntryAdded": "Added " +
        "{setCount}x{repetitionCount}x{weight} to exercise {trackableTitle}",
    "activities.numericalGoalProgressChanged":
        "Increased goal {trackableTitle} progress by {delta}",
    "activities.taskGoalProgressChanged":
        "Completed {taskTitle} of goal {trackableTitle}",
    "activities.trackableAdded": `Created {trackableType, select,
        Counter {counter}
        GymExercise {gym exercise}
        other {goal}
    } {trackableTitle}`,
    "activitiesNavigation.friends": "Friends",
    "activitiesNavigation.my": "My",
    "activityList.loginToSeeFriends": "Please login to see your friends data",
    "addTrackable.title": "What would you like to add?",
    "aggregate.total": "Total: {progress}",
    "approveTrackable.title": "How difficult do you think it was?",
    "archiveNavigation.approvedTrackables": "Approved",
    "archiveNavigation.expiredTrackables": "Expired",
    "archiveNavigation.rejectedTrackables": "Rejected",
    "commands.addProgress": "Add progress",
    "commands.aggregate": "Aggregate",
    "commands.back": "Back",
    "commands.break": "Break",
    "commands.edit": "Edit",
    "commands.new": "New",
    "commands.profile": "Profile",
    "commands.remove": "Remove",
    "commands.share": "Share",
    "commands.unaggregate": "Unaggregate",
    "common.areYouSure": "Are you sure?",
    "common.brand": "Completoo",
    "common.cancel": "Cancel",
    "common.chooseAction": "What would you like to do?",
    "common.done": "Done",
    "common.less": "Less",
    "common.loading": "Loading...",
    "common.login": "Login",
    "common.more": "More",
    "common.no": "No",
    "common.noData": "No data",
    "common.ok": "OK",
    "common.remove": "Remove",
    "common.select": "Select",
    "common.yes": "Yes",
    "counterForm.titleLabel": "I want to count",
    "counterForm.titlePlaceholder": "Burgers eaten",
    "datePicker.title": "Please select",
    "difficulties.easy": "Easy",
    "difficulties.hard": "Hard",
    "difficulties.impossible": "Impossible",
    "difficulties.medium": "Medium",
    "errors.emptyValue": "Can't be empty",
    "errors.negativeOrNotNumber": "Should be a positive number",
    "errors.noTasks": "At least 1 task is required",
    "errors.unexpected": "Oops! Something went wrong",
    "errors.zeroOrNegativeOrNotInteger": "Should be a positive integer",
    "errors.zeroOrNotNumber": "Should be a non-zero number",
    "friends.loginToSee": "Please login to see your friends",
    "globalNavigation.activities": "Activities",
    "globalNavigation.friends": "Friends",
    "globalNavigation.leaders": "Leaders",
    "globalNavigation.pendingReview": "Pending review",
    "globalNavigation.profile": "Profile",
    "goalForm.titleLabel": "I must",
    "goalForm.titlePlaceholder": "Do something big",
    "gymExercise.entry": `{hasSetCount, select,
        true {{setCount}x}
        false {}
    }{repetitionCount}x{weight}`,
    "gymExercise.entryAveraged":
        `{setCount}\nx\n{repetitionCount}\nx\n{weight}`,
    "gymExerciseEntryForm.repetitionCountPlaceholder": "Repetition count",
    "gymExerciseEntryForm.setCountPlaceholder": "Set count",
    "gymExerciseEntryForm.weightPlaceholder": "Weight",
    "gymExerciseForm.titleLabel": "Exercise",
    "gymExerciseForm.titlePlaceholder": "Deadlift",
    "intro.skip": "Skip",
    "leaderList.loginToSeeFriends": "Please login to see your friends data",
    "leadersNavigation.friends": "Friends",
    "leadersNavigation.global": "Global",
    "notifications.goalAchieved": "Goal achieved! Now it's time to prove it.",
    "notifications.goalApproved": "Goal approved!",
    "notifications.goalPendingReview": "Goal is pending review now.",
    "notifications.reviewRewarded":
        "You have earned {rating} rating for doing review",
    "notifications.userReported": "Thank you for improving our service!",
    "numericalEntryForm.entryPlaceholder": "1",
    "numericalGoalForm.maxProgressLabel": "Max progress",
    "numericalGoalForm.maxProgressPlaceholder": "0",
    "pendingReviewList.loginToReview": "Please login to do review",
    "pendingReviewList.loginToSeeFriends":
        "Please login to see your friends data",
    "profile.activeTrackables": "In Progress",
    "profile.archive": "Archive",
    "profileForm.loginMessage": "Please login to edit your profile",
    "profileForm.namePlaceholder": "Name",
    "profileForm.title": "Profile",
    "reasons.abuse": "Abuse",
    "reasons.cheating": "Cheating",
    "reasons.other": "Other",
    "reasons.spam": "Spam",
    "rejectTrackable.title": "Please select a reason",
    "reportUser.title": "Report user for",
    "reviewsNavigation.friendsTrackables": "Friends",
    "reviewsNavigation.globalTrackables": "Global",
    "reviewsNavigation.myTrackables": "My",
    "share.app": "Yo, check this out!",
    "share.newTrackable": `I've created new {type, select,
        Counter {counter}
        GymExercise {gym exercise}
        other {goal}
    }: {title}`,
    "share.provedGoal": "I've achieved my goal: {title}",
    "shareProvedGoal.title": "Do you want to share it on Facebook?",
    "taskGoalForm.newTaskTitlePlaceholder": "Do something small",
    "taskGoalForm.tasksLabel": "Tasks",
    "trackable.achievementPeriod": `Achieved {period, plural,
        =1 {in {period} day}
        other {in {period} days}
    }`,
    "trackable.activePeriod": `Created {period, plural,
        =0 {today}
        =1 {{period} day ago}
        other {{period} days ago}
    }`,
    "trackable.approve": "Approve",
    "trackable.expirationPeriod": `Expired after {period, plural,
        =1 {{period} day}
        other {{period} days}
    }`,
    "trackable.prove": "Prove",
    "trackable.reject": "Reject",
    "trackableForm.advancedSection": "Advanced",
    "trackableForm.deadlineDateLabel": "Until",
    "trackableForm.deadlineDatePlaceholder": "Deadline",
    "trackableForm.difficultyLabel": "Difficulty",
    "trackableForm.iconLabel": "Icon",
    "trackableForm.isPublicHint": "Visible to everyone and gives you a score"
        + " if receives enough approves from other users",
    "trackableForm.isPublicLabel": "Public",
    "trackableForm.progressDisplayModeLabel": "Display absolute value",
    "trackableForm.shareLabel": "Share on Facebook",
    "trackableTypes.counter": "Counter",
    "trackableTypes.gymExercise": "Gym Exercise",
    "trackableTypes.numericalGoal": "Numerical Goal",
    "trackableTypes.taskGoal": "Task Goal",
} as any;
