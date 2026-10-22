# Habit

A personal habit tracker. One person records what they did on each day, and sees the history of
each habit as a grid of squares.

## Language

### Habits

**Habit**:
A thing that the person tracks day by day, such as "drink water" or "smoke".
_Avoid_: Tracker, goal, activity

**Kind**:
The form of the value that a Habit records for a Day. Each Habit has one Kind:

- **check**: done or not done.
- **number**: a quantity, with an optional unit and an optional Target.
- **choice**: one Option from an unordered list, such as the type of workout.
- **scale**: one Option from an ordered list, such as mood from bad to good.
- **text**: free text, such as a note.

_Avoid_: Type

**Direction**:
What the person wants from a Habit: `build` (to do it, or more of it) or `quit` (to stop it, or
less of it). The Direction does not change how the squares look.
_Avoid_: Polarity, positive/negative, good/bad habit

**Target**:
The quantity that fills the square of a number Habit for a Day completely. For a quit Habit, the
Target is the limit that the person accepts.
_Avoid_: Goal, daily goal

**Step**:
The quantity that one tap adds to the Entry of a number Habit.
_Avoid_: Increment

**Option**:
One of the values that the person defines for a choice Habit or a scale Habit. A retired Option is
not offered for new Entries, but the old Entries keep it.

### Days

**Day**:
A calendar date in the local time of the person, without a time of day or a time zone.

**Entry**:
The value of one Habit on one Day. A Habit has a maximum of one Entry for each Day. A Day without
an Entry has no data: it does not mean "not done" or "clean".
_Avoid_: Check-in, completion, mark, record, log

**Intensity**:
How much of the square of a Day is filled, from empty to full. The Entry and the Kind of the Habit
give the Intensity.
