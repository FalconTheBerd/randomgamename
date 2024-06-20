import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, get, child, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAF2E7ZKI8dqYyYmGwLIruBBVG4SEV9ZQ",
    authDomain: "turnbasedrpg-4850c.firebaseapp.com",
    projectId: "turnbasedrpg-4850c",
    storageBucket: "turnbasedrpg-4850c.appspot.com",
    messagingSenderId: "240211116800",
    appId: "1:240211116800:web:0c6ed56a7233290632e9e5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();
const analytics = getAnalytics(app);

document.addEventListener('DOMContentLoaded', () => {
    const isGitHubPages = location.hostname.includes('github.io');
    const repoName = 'randomgamename';
    const imagePath = isGitHubPages 
        ? `/${repoName}/assets/title.jpg` 
        : '../assets/title.jpg';
    
    document.body.style.background = `url(${imagePath}) no-repeat center center fixed`;
});

function logout() {
    const uId = localStorage.getItem('userId');
    if (uId) {
        const userRef = ref(db, 'users/' + uId);
        update(userRef, {
            status: 'Offline'
        })
            .then(() => {
                console.log('User status updated to Offline');
                localStorage.clear();
                alert('Logged out successfully');
                location.reload();
            })
            .catch((error) => {
                console.error("Error updating user status:", error);
                localStorage.clear();
                alert('Logged out successfully (status update failed)');
                location.reload();
            });
    } else {
        localStorage.clear();
        alert('Logged out successfully');
        location.reload();
    }
}

document.getElementById('logOutButton').addEventListener('click', logout);

window.playFunction = function playFunction() {
    alert("Play button clicked");
}

window.settingsFunction = function settingsFunction() {
    alert("Settings button clicked");
}

window.socialFunction = function socialFunction() {
    fetchFriends();
    document.getElementById('friendsPopup').style.display = 'block';
}

window.openPopup = function openPopup() {
    document.getElementById('accountPopup').style.display = 'block';
}

window.closePopup = function closePopup() {
    document.getElementById('accountPopup').style.display = 'none';
}

window.closeFriendsPopup = function closeFriendsPopup() {
    document.getElementById('friendsPopup').style.display = 'none';
}

window.showSignUpForm = function showSignUpForm() {
    document.getElementById('signInForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
    document.getElementById('resetPasswordForm').style.display = 'none';
}

window.showSignInForm = function showSignInForm() {
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('signInForm').style.display = 'block';
    document.getElementById('resetPasswordForm').style.display = 'none';
}

window.showResetPasswordForm = function showResetPasswordForm() {
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('signInForm').style.display = 'none';
    document.getElementById('resetPasswordForm').style.display = 'block';
}

function registerDatabase(id, email) {
    set(ref(db, 'users/' + id), {
        uid: id,
        email: email,
        status: 'Offline',
        friends: {
            kia: {
                name: "Kia",
                addedOn: new Date().toISOString()
            }
        }
    }).then(() => {
        console.log("User registered successfully");
    }).catch((error) => {
        console.error("Error registering user:", error);
    });
}

document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userRef = ref(db, 'users/' + user.uid);
            update(userRef, {
                status: 'Online'
            })
                .then(() => {
                    localStorage.setItem('auth', 'True');
                    localStorage.setItem('userEmail', user.email);
                    localStorage.setItem('userId', user.uid);
                    alert('Signed in successfully');
                    closePopup();
                })
                .catch((error) => {
                    console.error("Error updating user status:", error);
                    alert('Signed in successfully, but failed to update status');
                    closePopup();
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error: ${errorMessage}`);
        });
});

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            registerDatabase(user.uid, user.email);
            alert('Signed up successfully');
            closePopup();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error: ${errorMessage}`);
        });
});

document.getElementById('reset-password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert('Password reset email sent');
            closePopup();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error: ${errorMessage}`);
        });
});

function addFriend() {
    const friendEmail = prompt("Enter your friend's email:");

    if (!friendEmail) {
        return;
    }

    const usersRef = ref(db, 'users');

    get(usersRef).then((snapshot) => {
        let friendId = null;
        let currentUserId = localStorage.getItem('userId');
        let currentUserUsername = localStorage.getItem('username');

        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            if (user.email === friendEmail) {
                friendId = childSnapshot.key;
            }
        });

        if (friendId) {
            const userFriendsRef = ref(db, `users/${currentUserId}/friends`);
            const friendName = currentUserUsername;
            const friendData = {
                name: friendName,
                addedOn: new Date().toISOString()
            };

            update(child(userFriendsRef, friendId), friendData)
                .then(() => {
                    const friendFriendsRef = ref(db, `users/${friendId}/friends`);
                    const userData = {
                        name: friendEmail.split('@')[0],
                        addedOn: new Date().toISOString()
                    };

                    update(child(friendFriendsRef, currentUserId), userData)
                        .then(() => {
                            alert(`Added ${friendEmail} as a friend.`);
                            fetchFriends();
                        })
                        .catch((error) => {
                            console.error('Error adding current user as friend:', error);
                            alert('Failed to add friend.');
                        });
                })
                .catch((error) => {
                    console.error('Error adding friend:', error);
                    alert('Failed to add friend.');
                });

        } else {
            alert(`User with email ${friendEmail} does not exist.`);
        }
    }).catch((error) => {
        console.error('Error checking friend email:', error);
        alert('Failed to check friend email.');
    });
}

document.getElementById('addFriendButton').addEventListener('click', addFriend);


function fetchFriends() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('No user logged in');
        return;
    }

    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = 'Loading...';

    const userRef = ref(db, `users/${userId}/friends`);

    get(userRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const friends = snapshot.val();
                friendsList.innerHTML = '';
                for (const friendId in friends) {
                    const friendRef = ref(db, `users/${friendId}`);
                    Promise.all([
                        get(friendRef),
                        getUserOnlineStatus(friendId)
                    ]).then(([friendSnapshot, onlineStatus]) => {
                        if (friendSnapshot.exists()) {
                            const friendData = friendSnapshot.val();
                            const friendItem = document.createElement('div');
                            friendItem.classList.add('friend-item');

                            const friendName = document.createElement('span');
                            friendName.textContent = `${friendData.username} (${onlineStatus})`;
                            friendName.classList.add('friend-name');
                            friendName.addEventListener('click', () => toggleButtons(friendItem));
                            friendItem.appendChild(friendName);

                            const buttonsContainer = document.createElement('div');
                            buttonsContainer.classList.add('buttons-container');

                            const inviteButton = document.createElement('button');
                            inviteButton.textContent = 'Invite to Party';
                            inviteButton.classList.add('invite-button');
                            inviteButton.addEventListener('click', () => {
                                const userId = localStorage.getItem('userId');
                                const username = localStorage.getItem('email');
                                const friendId = friendData.uid;

                                if (!userId || !friendId) {
                                    alert('Error: User or friend ID not found.');
                                    return;
                                }

                                // Send the invitation
                                const invitationRef = ref(db, `invitations/${friendId}/${userId}`);
                                set(invitationRef, {
                                    from: username,
                                    fromName: username, // Send the username with the invitation
                                    status: 'pending',
                                    timestamp: new Date().toISOString()
                                }).then(() => {
                                    // alert(`Invitation sent to ${friendData.username || friendData.email.split('@')[0]}`);
                                }).catch(error => {
                                    console.error('Error sending invitation:', error);
                                    alert('Failed to send invitation.');
                                });
                            });






                            const unfriendButton = document.createElement('button');
                            unfriendButton.textContent = 'Unfriend';
                            unfriendButton.classList.add('unfriend-button');
                            unfriendButton.addEventListener('click', () => {
                                if (confirm('Are you sure you want to unfriend this user?')) {
                                    remove(child(userRef, friendId))
                                        .then(() => {
                                            return remove(ref(db, `users/${friendId}/friends/${userId}`));
                                        })
                                        .then(() => {
                                            alert('Unfriended successfully');
                                            fetchFriends();
                                        })
                                        .catch((error) => {
                                            console.error('Error unfriending user:', error);
                                            alert('Failed to unfriend user.');
                                        });
                                }
                            });

                            buttonsContainer.appendChild(inviteButton);
                            buttonsContainer.appendChild(unfriendButton);
                            friendItem.appendChild(buttonsContainer);

                            friendsList.appendChild(friendItem);
                        }
                    });
                }
            } else {
                friendsList.innerHTML = 'No friends found';
            }
        })
        .catch((error) => {
            console.error('Error fetching friends:', error);
            friendsList.innerHTML = 'Error loading friends';
        });
}

function getUserOnlineStatus(userId) {
    return get(ref(db, `users/${userId}/status`))
        .then(snapshot => snapshot.exists() ? snapshot.val() : 'Offline')
        .catch(error => {
            console.error('Error fetching user status:', error);
            return 'Unknown';
        });
}

function toggleButtons(friendItem) {
    const buttonsContainer = friendItem.querySelector('.buttons-container');
    if (buttonsContainer.style.display === 'block') {
        buttonsContainer.style.display = 'none';
    } else {
        buttonsContainer.style.display = 'block';
    }
}

// Function to fetch party invitations
function fetchPartyInvitations() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        return;
    }

    const invitationsRef = ref(db, `invitations/${userId}`);
    onValue(invitationsRef, (snapshot) => {
        if (snapshot.exists()) {
            const invitations = snapshot.val();
            const invitationContainer = document.getElementById('invitationContainer');
            invitationContainer.innerHTML = '';

            for (const senderId in invitations) {
                const invitation = invitations[senderId];
                if (invitation.status === 'pending') {
                    displayInvitationNotification(senderId, invitation.timestamp);
                }
            }
        }
    });
}


function acceptInvitation(userId, senderId, notificationElement) {
    const invitationRef = ref(db, `invitations/${userId}/${senderId}`);
    const senderPartyRef = ref(db, `users/${senderId}/party`);
    const userPartyRef = ref(db, `users/${userId}/party`);

    // Fetch the current party members of the sender
    get(senderPartyRef).then(snapshot => {
        let senderPartyMembers = snapshot.exists() ? snapshot.val() : {};

        // Add the current user to the sender's party
        senderPartyMembers[userId] = true;

        // Update the sender's party in the database
        set(senderPartyRef, senderPartyMembers).then(() => {
            // Fetch the current party members of the user
            get(userPartyRef).then(snapshot => {
                let userPartyMembers = snapshot.exists() ? snapshot.val() : {};

                // Add the sender to the user's party
                userPartyMembers[senderId] = true;

                // Update the user's party in the database
                set(userPartyRef, userPartyMembers).then(() => {
                    // Remove the invitation
                    remove(invitationRef).then(() => {
                        console.log('Invitation removed');
                        alert('Invitation accepted and both parties updated.');
                        // Remove the notification element
                        if (notificationElement) {
                            notificationElement.remove();
                        }
                    }).catch((error) => {
                        console.error('Error removing invitation:', error);
                    });
                }).catch(error => {
                    console.error('Error updating user party:', error);
                    alert('Failed to accept invitation.');
                });
            }).catch(error => {
                console.error('Error fetching user party data:', error);
                alert('Failed to fetch user party data.');
            });
        }).catch(error => {
            console.error('Error updating sender party:', error);
            alert('Failed to accept invitation.');
        });
    }).catch(error => {
        console.error('Error fetching sender party data:', error);
        alert('Failed to fetch sender party data.');
    });
}




function declineInvitation(userId, inviterId, notificationElement) {
    const invitationRef = ref(db, `invitations/${userId}/${inviterId}`);
    update(invitationRef, { status: 'declined' }).then(() => {
        // Handle additional logic for declining the invitation
        alert('Invitation declined');
        // Remove the invitation
        remove(invitationRef).then(() => {
            console.log('Invitation removed');
            // Remove the notification element
            if (notificationElement) {
                notificationElement.remove();
            }
        }).catch((error) => {
            console.error('Error removing invitation:', error);
        });
    }).catch(error => {
        console.error('Error declining invitation:', error);
        alert('Failed to decline invitation.');
    });
}


function handleInvitationResponse(inviterId, isAccepted, notificationElement) {
    const userId = localStorage.getItem('userId');
    const invitationRef = ref(db, `invitations/${userId}/${inviterId}`);

    if (isAccepted) {
        acceptInvitation(userId, inviterId, notificationElement);
    } else {
        declineInvitation(userId, inviterId, notificationElement);
    }
}


function displayInvitationNotification(inviterId, timestamp) {
    const notificationArea = document.getElementById('notification-area');

    const notification = document.createElement('div');
    notification.classList.add('notification');

    const inviterNameRef = ref(db, `users/${inviterId}/username`);
    get(inviterNameRef).then((snapshot) => {
        const inviterName = snapshot.val() || inviterId;
        notification.innerHTML = `
            <p>${inviterName} has invited you to a party.</p>
            <button class="accept-button">Accept</button>
            <button class="decline-button">Decline</button>
        `;

        const acceptButton = notification.querySelector('.accept-button');
        const declineButton = notification.querySelector('.decline-button');

        acceptButton.addEventListener('click', () => handleInvitationResponse(inviterId, true, notification));
        declineButton.addEventListener('click', () => handleInvitationResponse(inviterId, false, notification));

        notificationArea.appendChild(notification);
    });
}

function removeFromAllParties(userId) {
    const usersRef = ref(db, 'users');

    // Fetch all users
    get(usersRef).then(snapshot => {
        if (snapshot.exists()) {
            const allUsers = snapshot.val();

            // Create an array of promises to remove the user from all parties
            const promises = Object.keys(allUsers).map(otherUserId => {
                if (otherUserId !== userId) {  // Avoid self-removal
                    const otherUserPartyRef = ref(db, `users/${otherUserId}/party/${userId}`);

                    // Remove the current user from the other user's party
                    return remove(otherUserPartyRef).then(() => {
                        console.log(`Removed from ${otherUserId}'s party`);
                    }).catch(error => {
                        console.error(`Error removing from ${otherUserId}'s party:`, error);
                    });
                }
            });

            // Add a promise to clear the user's own party
            const userPartyRef = ref(db, `users/${userId}/party`);
            promises.push(remove(userPartyRef).then(() => {
                console.log(`Cleared ${userId}'s own party`);
            }).catch(error => {
                console.error(`Error clearing ${userId}'s own party:`, error);
            }));

            // Wait for all promises to complete
            Promise.all(promises).then(() => {
                console.log('Removed from all parties and cleared own party');
            }).catch(error => {
                console.error('Error removing from all parties or clearing own party:', error);
            });
        } else {
            console.log('No users found');
        }
    }).catch(error => {
        console.error('Error fetching users:', error);
    });
}

document.getElementById('leavePartyButton').addEventListener('click', () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        removeFromAllParties(userId);
    } else {
        alert('User ID not found');
    }
});


// Call the function to start listening for party invitations
fetchPartyInvitations();
