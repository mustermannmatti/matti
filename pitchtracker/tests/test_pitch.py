import numpy as np
import pytest

from pitchtracker.pitch import PitchCalibration, parse_corners


CORNERS = np.array([[200, 100], [1100, 100], [1250, 650], [50, 650]], dtype=np.float32)


def test_corners_map_to_pitch_corners():
    cal = PitchCalibration(CORNERS)
    out = cal.to_pitch(CORNERS)
    expected = np.array([[0, 0], [105, 0], [105, 68], [0, 68]])
    assert np.allclose(out, expected, atol=0.01)


def test_center_of_image_trapezoid_maps_near_pitch_center():
    cal = PitchCalibration(CORNERS)
    # Intersection of the diagonals of the trapezoid is the projected pitch center.
    # Rough check: the mean of the corners must land somewhere mid-pitch.
    mid = CORNERS.mean(axis=0, keepdims=True)
    out = cal.to_pitch(mid)[0]
    assert 30 < out[0] < 75
    assert 15 < out[1] < 53


def test_custom_pitch_size():
    cal = PitchCalibration(CORNERS, pitch_length_m=90, pitch_width_m=55)
    out = cal.to_pitch(CORNERS)
    assert np.allclose(out, [[0, 0], [90, 0], [90, 55], [0, 55]], atol=0.01)


def test_inside_pitch_mask():
    cal = PitchCalibration(CORNERS)
    pts = np.array([[50, 30], [-10, 30], [50, 80], [106, 69]])
    mask = cal.inside_pitch(pts)
    assert mask.tolist() == [True, False, False, True]  # 3m margin allows the last


def test_parse_corners():
    arr = parse_corners("200,100 1100,100 1250,650 50,650")
    assert arr.shape == (4, 2)
    assert np.allclose(arr, CORNERS)
    with pytest.raises(ValueError):
        parse_corners("1,2 3,4")
