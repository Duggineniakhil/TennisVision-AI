import cv2
import numpy as np
import sys
sys.path.append('../')
import constants
from utils import convert_meters_to_pixel_distance

class MiniCourt():
    def __init__(self, frame):
        self.drawing_rectangle_width = 250
        self.drawing_rectangle_height = 400
        self.buffer = 50
        self.padding_court = 20

        self.set_canvas_background_box_position(frame)
        self.set_mini_court_position()
        self.set_court_drawing_key_points()
        self.set_court_lines()

    def convert_meters_to_pixels(self, meters):
        return convert_meters_to_pixel_distance(
            meters,
            constants.COURT_WIDTH,
            self.court_drawing_width
        )

    def get_width_of_mini_court(self):
        return self.court_drawing_width

    def set_canvas_background_box_position(self, frame):
        self.end_x = frame.shape[1] - self.buffer
        self.end_y = self.buffer + self.drawing_rectangle_height
        self.start_x = self.end_x - self.drawing_rectangle_width
        self.start_y = self.end_y - self.drawing_rectangle_height

    def set_mini_court_position(self):
        self.court_start_x = self.start_x + self.padding_court
        self.court_start_y = self.start_y + self.padding_court
        self.court_end_x = self.end_x - self.padding_court
        self.court_end_y = self.end_y - self.padding_court
        self.court_drawing_width = self.court_end_x - self.court_start_x
        self.court_drawing_height = self.court_end_y - self.court_start_y

    def set_court_drawing_key_points(self):
        """
        Define keypoints for a Padel court (10m x 20m).
        0: Top Left
        1: Top Right
        2: Bottom Left
        3: Bottom Right
        4: Left Net
        5: Right Net
        6: Top Service Line Left
        7: Top Service Line Right
        8: Bottom Service Line Left
        9: Bottom Service Line Right
        10: Top Center Service Line
        11: Bottom Center Service Line
        """
        w = self.court_drawing_width
        h = self.court_drawing_height
        
        # Padel court is 20m long. Service line is 6.95m from the net (which is at 10m).
        service_line_pixels = self.convert_meters_to_pixels(constants.SERVICE_LINE_DIST)
        mid_y = h / 2

        self.points = {
            "TL": (self.court_start_x, self.court_start_y),
            "TR": (self.court_end_x, self.court_start_y),
            "BL": (self.court_start_x, self.court_end_y),
            "BR": (self.court_end_x, self.court_end_y),
            
            "NetL": (self.court_start_x, self.court_start_y + mid_y),
            "NetR": (self.court_end_x, self.court_start_y + mid_y),
            
            "TopSL_L": (self.court_start_x, self.court_start_y + mid_y - service_line_pixels),
            "TopSL_R": (self.court_end_x, self.court_start_y + mid_y - service_line_pixels),
            
            "BotSL_L": (self.court_start_x, self.court_start_y + mid_y + service_line_pixels),
            "BotSL_R": (self.court_end_x, self.court_start_y + mid_y + service_line_pixels),
            
            "TopCenter": (self.court_start_x + w/2, self.court_start_y + mid_y - service_line_pixels),
            "BotCenter": (self.court_start_x + w/2, self.court_start_y + mid_y + service_line_pixels),
            "NetCenter": (self.court_start_x + w/2, self.court_start_y + mid_y)
        }

    def set_court_lines(self):
        self.lines = [
            ("TL", "TR"), ("BL", "BR"),     # Baselines
            ("TL", "BL"), ("TR", "BR"),     # Sidelines
            ("TopSL_L", "TopSL_R"),         # Top Service Line
            ("BotSL_L", "BotSL_R"),         # Bottom Service Line
            ("TopCenter", "NetCenter"),     # Top Center Service Line
            ("BotCenter", "NetCenter")      # Bottom Center Service Line
        ]

    def draw_court(self, frame):
        # Draw all lines
        for p1, p2 in self.lines:
            pt1 = (int(self.points[p1][0]), int(self.points[p1][1]))
            pt2 = (int(self.points[p2][0]), int(self.points[p2][1]))
            cv2.line(frame, pt1, pt2, (255, 255, 255), 2)
            
        # Draw Net (Thicker blue line)
        pt_net_l = (int(self.points["NetL"][0]), int(self.points["NetL"][1]))
        pt_net_r = (int(self.points["NetR"][0]), int(self.points["NetR"][1]))
        cv2.line(frame, pt_net_l, pt_net_r, (255, 100, 100), 3)

        return frame

    def draw_background_rectangle(self, frame):
        shapes = np.zeros_like(frame, np.uint8)
        # Draw a beautiful blue padel court background
        cv2.rectangle(shapes, (self.start_x, self.start_y), (self.end_x, self.end_y), (150, 70, 0), cv2.FILLED) # Outer area
        cv2.rectangle(shapes, (self.court_start_x, self.court_start_y), (self.court_end_x, self.court_end_y), (180, 80, 20), cv2.FILLED) # Inner court area (Blue)
        
        out = frame.copy()
        alpha = 0.5
        mask = shapes.astype(bool)
        out[mask] = cv2.addWeighted(frame, alpha, shapes, 1 - alpha, 0)[mask]
        return out

    def draw_mini_court(self, frames):
        output_frames = []
        for frame in frames:
            frame_copy = frame.copy()
            frame_copy = self.draw_background_rectangle(frame_copy)
            frame_copy = self.draw_court(frame_copy)
            output_frames.append(frame_copy)
        return output_frames

    def draw_points_on_mini_court(self, frames, positions, color=(0, 255, 0)):
        for frame_num, frame in enumerate(frames):
            if frame_num < len(positions):
                for _, position in positions[frame_num].items():
                    x, y = position
                    cv2.circle(frame, (int(x), int(y)), 6, color, -1)
        return frames
