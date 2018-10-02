# Coffee Connect #
### An App to help indecicive people figure out where to meet ###

Note - For the app to work as intended, it will need access to the user's current location.  **This location is not permanently saved anywhere, and is only used to define the map's starting center**

To use the app: 
- One person in the group will need to go to the [homepage](https://whispering-peak-26762.herokuapp.com/)
- They can create a new account, or login if they have visited before
    - Either way, a new group will be created with a unique Group Number
    - Accounts are not associated with a specific group, so the same login credentails can be used to create/join multiple groups
- On the following screen, users will see a modal containing the URL needed to join the group.  This link will need to be provided to all other members of the group
    - The group cannot be joined without using this link
    - All other group members will see a similar login/signup screen, but a new group will not be created
- After logging in, users will need to move the map around until the Green center marker is over their prefered starting location
    - By default, the map is centered on the user's current location
        - This location is not guaranteed to be on the user's precise location, and can sometimes be very off due to inconsistencies with the navigator API
    - Users cannot see other people's current or submitted location, only their own
    - It is not required to have an extremely precise location submitted, unless the user wants to see directions from a precice location
- As users submit their locations, a Blue dotted marker will appear on the map.  This is the [Group's Center Location](#calculating-group's-center-location)
- If a user has submitted a location, they will also see coffee shops that are within 500 meters of the Group's Center, denoted by Red lettered markers
    - This is dependent on what Google has listed as a "cafe".  Some cafes may not appear, and some places may appear that normally wouldn't be considered cafes
    - Users that are logged in but have not yet submitted a location will not see these results
- Clicking a red marker will have that venue's information appear below the map
    - Some information, like Open hours and Rating, are not guaranteed
- Users can then vote on a location they'd like to go to
    - While users can change their vote at any time, they cannot vote multiple times for a single place or have votes on multiple places simultaneously
    - There is currently not a way to finalize voting or stop specific people from voting
- Users are also able to change their location at any time.
    - If any user changes their location, all maps will be updated with the new group center and nearby results
    - This also clears out any previous votes, so users may want to vote again
- If a user logs out or leaves/refreshes the page:
    - They are logged out in terms of auth
    - They are removed from the group, and any group/location information associated with them is deleted
        - Their account credentials are saved, so they do not need to create a new account to join back.  They will, however, need the joining URL
        - The group's center will be re-calculated with the remaining users, so others online may see the map move and their votes disappear
- If there are no more online users in a group, then the group and any associated information is deleted
    - This makes the joining URL no longer usable, so a new group will need to be made


## Calculating Group's Center Location
All users' locations are saved as a latitude/longitute pair.  When a user submits a new location, the database is updated with that lat/lng.  Then, the lat/lngs of all users in that group are collected, and the minimums and maximums are calculated.  Finally, the midpoint between the two extremes are calculated and saved as the group's center lat/lng.

You can think of it like the group is inside a rectangle, with the Group's Center being the center of the rectangle.  If a user submits a location outside the rectangle, the rectangle gets bigger to include that user, and the center of this new rectangle is used as the Group's Center.