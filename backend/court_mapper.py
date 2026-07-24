import cv2
import numpy as np

class CourtMapper:
    def __init__(self, court_landmarks, mini_court):
        """
        court_landmarks: Dictionary of YOLO-detected padel court landmarks {class_name: [(x, y), ...]}
        mini_court: Instance of MiniCourt (has the 2D coordinate space defined)
        """
        self.homography_matrix = None
        
        # 1. Extract 4 outer corners from court_landmarks
        # We assume the user's model labels the 4 main corners as 'Field_keypoint' or similar.
        # Look for a class that has at least 4 points (the corners).
        src_points = None
        for class_name, points in court_landmarks.items():
            if len(points) >= 4:
                # We found the corners (e.g., Field_keypoint)
                src_points = self._sort_corners(points[:4])
                break
                
        if src_points is None:
            # Fallback if court keypoint detection failed completely
            self.homography_matrix = np.eye(3)
            return

        # 2. Get the corresponding 4 destination points on the mini_court
        dst_points = self._get_mini_court_corners(mini_court)
        
        # 3. Compute Homography matrix
        self.homography_matrix, _ = cv2.findHomography(
            np.array(src_points, dtype=np.float32), 
            np.array(dst_points, dtype=np.float32)
        )

    def _sort_corners(self, points):
        """
        Sort 4 points into Top-Left, Top-Right, Bottom-Right, Bottom-Left
        assuming a standard broadcast camera view.
        """
        # Sort by y-coordinate
        sorted_by_y = sorted(points, key=lambda p: p[1])
        top_points = sorted_by_y[:2]    # furthest from camera
        bottom_points = sorted_by_y[2:] # closest to camera
        
        # Sort top points by x-coordinate
        tl, tr = sorted(top_points, key=lambda p: p[0])
        # Sort bottom points by x-coordinate
        bl, br = sorted(bottom_points, key=lambda p: p[0])
        
        return [tl, tr, br, bl]

    def _get_mini_court_corners(self, mini_court):
        """
        Get the 4 corners of the 2D mini court.
        """
        # Top-Left, Top-Right, Bottom-Right, Bottom-Left
        tl = (mini_court.court_start_x, mini_court.court_start_y)
        tr = (mini_court.court_end_x, mini_court.court_start_y)
        br = (mini_court.court_end_x, mini_court.court_end_y)
        bl = (mini_court.court_start_x, mini_court.court_end_y)
        return [tl, tr, br, bl]

    def get_mini_court_coordinates(self, object_position):
        """
        Convert a single (x, y) video coordinate to (x, y) mini-court coordinate.
        """
        if self.homography_matrix is None:
            return object_position
            
        # Convert to homogenous coordinates
        pt = np.array([[[object_position[0], object_position[1]]]], dtype=np.float32)
        dst_pt = cv2.perspectiveTransform(pt, self.homography_matrix)
        
        return (int(dst_pt[0][0][0]), int(dst_pt[0][0][1]))
