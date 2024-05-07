import axios from "axios";

const AddToCollection = async ({token, selectedStatus, selectedRating, kitId}) => {
  try {
    // If there is no current session, alert user and do nothing
    if (!token) {
        alert('You need to log in to perform this action')
        return;
    } 

    // If status is not picked, set as "Want"
    const statusToSend = selectedStatus === 0 ? 3 : selectedStatus;

    // Details to send to database
    const payload = {
      kitId,
      status: statusToSend,
      rating: selectedRating,
    };


    // Post details and authentication to API
    const response = await axios.post('/api/user/collection/add', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If there is no response send an error
    if (!response.data) {
      throw new Error('Failed to update collection');
    }

    // Refresh the page to show updated information
    window.location.reload();    

    // If any unhandled errors occur, alert user
  } catch (error) {
    console.error('Error updating collection:', error);
    alert('Failed to update collection')
  }
};

export default AddToCollection;