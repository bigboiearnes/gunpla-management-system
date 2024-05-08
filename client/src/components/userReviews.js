import { useEffect, useState } from "react";
import axios from "axios";
import Filter from "bad-words";
import './UserReviews.css'

function UserReviews ({ selectedStatus, selectedRating, kitId, reviewers, token }) {
    const [reviews, setReviews] = useState('');
    const [reviewInput, setReviewInput] = useState('');
    const [reviewMode, setReviewMode] = useState(false);
    const filter = new Filter();
    const minLength = 100;

    useEffect(() => {
        const fetchReviews = async () => {
            // Fetch reviewers collection
            const collectionPromises = reviewers.map(async (reviewer) => {
                const username = typeof reviewer === 'object' ? reviewer.username : reviewer;
                try {
                    const response = await axios.get(`/api/user/collection/fetch/${username}`);
                    const collectionData = response.data; // Assuming the response contains the data directly
                    // Find the item with the review property
                    const reviewItem = collectionData.collection.find(item => item.kitId === kitId);
                    if (!reviewItem) {
                        console.error(`${username} has no review`);
                        return null; // Return null if no review found
                    }
                    return {
                        username: username,
                        review: reviewItem.review,
                        rating: reviewItem.rating,
                        status: reviewItem.status,
                        image: reviewItem.image,
                        likes: reviewer.reviewLikes.length,
                        dislikes: reviewer.reviewDislikes.length
                    };
                } catch (error) {
                    // Return no data if error occurs
                    console.error(`Error fetching collection for ${username}:`, error);
                    return null;
                }
            });
    
            // Wait until all requests are complete
            const reviewsData = await Promise.all(collectionPromises);
    
            // Filter out null values (users with no reviews)
            const filteredReviews = reviewsData.filter(review => review !== null);

            const sortedReviews = filteredReviews.sort((a, b) => {
                const likesDifferenceA = a.likes - a.dislikes;
                const likesDifferenceB = b.likes - b.dislikes;
                return likesDifferenceB - likesDifferenceA;
            });
            
            setReviews(sortedReviews);
        };
    
        fetchReviews();
    }, [reviewers]);



    const handleLikeReview = async (kitId, username) => {
        try {
            await axios.post('/api/kits/review/like', { kitId, username }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            window.location.reload();  

        } catch (error) {
            console.error('Error occurred while liking review:', error);
            // Handle error
        }
    };

    const handleDislikeReview = async (kitId, username) => {
        try {
            await axios.post('/api/kits/review/dislike', { kitId, username }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            window.location.reload();  
        } catch (error) {
            console.error('Error occurred while disliking review:', error);
            // Handle error
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "1":
                return 'Built';
            case "2":
                return 'Owned';
            case "3":
                return 'Want';
            case "4":
                return 'Work In Progress';
            default:
                return 'Unknown';
        }
    };
    
    const getRatingLabel = (rating) => {
        if (rating === 0) {
            return '';
        } else {
            return `${rating}/10`;
        }
    };

    const getReviewText = (review) => {
        if (!review) {
            return '[REVIEW DELETED]';
        } else {
            return review;
        }
    }
    
    const handleReviewInputChange = e => {
        setReviewInput(e.target.value);
      };
    
    const handleToggleReviewMode = () => {
        setReviewMode(prevReviewMode => !prevReviewMode);
    }

    const handleSubmit = async () => {
        try {
            const review = filter.clean(reviewInput)
            console.log(reviewInput.length)

            let payload = {
                kitId,
                status: selectedStatus,
                rating: selectedRating,
                review,
            };

            if (reviewInput === "DELETE") {
                payload = {
                    kitId,
                    status: selectedStatus,
                    rating: selectedRating,
                    review: "DELETE",
                };
                
            } else if (reviewInput.length < 100) {

                console.log(reviewInput.length)
                return
                
            }

            console.log(reviewInput)

            

            

            const response = await axios.post('/api/user/collection/add', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.data) {
                throw new Error('Failed to update collection');
            }
        
            // Refresh page to update data
            window.location.reload();

        } catch (error) {

        }
        
    };

    const remainingCharacters = minLength - reviewInput.length;
    const isMinLengthReached = reviewInput.length >= minLength;

    return (
        <div className="review-section-wrapper">
            <div className="review-write-wrapper">
                {reviewMode ? (
                    <div className="review-edit-mode-wrapper">
                    <h2 className="write-review-h2">Write A Review</h2>
                    <div className="review-edit-content-wrapper">
                        <div className="review-edit-mode-write-wrapper">
                            
                            <textarea 
                            value={reviewInput}
                            className="review-edit-mode-write"
                            onChange={handleReviewInputChange}/>
                            <div className="review-char-counter">
                                {isMinLengthReached
                                ? `Minimum length reached (${reviewInput.length} characters)`
                                : `${remainingCharacters} characters left to reach the minimum length`}
                            </div>

                            
                        </div>

                        <div className="review-edit-mode-buttons-wrapper">
                        <button onClick={handleSubmit}>Submit</button>
                        {token && (
                            <button 
                            onClick={handleToggleReviewMode}>
                            Cancel
                            </button>
                        )}
                        </div>
                        <div className="review-edit-mode-label-wrapper">
                        <label>If you have an existing review, any new review will overwrite it.<br/>If you wish to delete your review, submit DELETE.<br/>Reviews must be at least 100 characters.<br/>The status and score will match those from your collection.</label>
                        </div>
                    </div>
                    </div>
                ) : (
                    <div className="review-no-edit-mode-wrapper">
                        {token && (
                            <button 
                            onClick={handleToggleReviewMode}>
                            Write Review
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="review-reviews-wrapper">
                <h2>Reviews</h2>
                {reviews.length > 0 ? (
                    <div className="review-wrapper">
                        {reviews.map((review, index) =>(
                            <div className="review-body" key={index}>
                                <div className="review-head">
                                    <a className='review-reviewer' href={`/profile/${review.username}`}>{review.username}</a>
                                    <div className="review-stats">
                                        <p className="review-stat">{getStatusLabel(review.status)}</p>
                                        <p className="review-stat">{getRatingLabel(review.rating)}</p>
                                    </div>
                                    <div className="review-like-buttons">
                                        <p className="review-content">{getReviewText(review.review)}</p>
                                        <button onClick={() => handleLikeReview(kitId, review.username)}>Likes: {review.likes}</button>
                                        <button onClick={() => handleDislikeReview(kitId, review.username)}>Dislikes: {review.dislikes}</button>
                                    </div>
                                </div>
                                <div className="review-content-wrapper">
                                
                                {review.image &&
                                <img className='collection-image' src={review.image} alt={review.kitId}/>
                                }
                                </div>
                                
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No reviews found</p>
                )}
            </div>
        </div>
    );
};

export default UserReviews;