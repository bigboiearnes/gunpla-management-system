import axios from "axios";

const RemoveFromCollection = async ({ kitId, token }) => {
    try {
        // If there is no current session, alert user and do nothing
        if (!token) {
            alert('You need to log in to perform this action')
            return;
        }

        // Post kitId and authentication to API
        const response = await axios.post('/api/user/collection/remove', { kitId }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        // If there is no response send an error
        if (!response.data) {
        throw new Error('Failed to update collection');
        }  
        return (null);    
    
        // If any unhandled errors occur, alert user
        } catch (error) {
        console.error('Error updating collection:', error);
        alert('Failed to update collection')
        }

}

export default RemoveFromCollection;