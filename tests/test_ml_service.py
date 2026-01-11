import pytest

# ============================================
# ML SERVICE WRAPPER
# ============================================
def verify_student_face(reference_photo, live_photo):
    """
    Face comparison service
    Returns: (is_match, confidence, message)
    """
    # Simulated response for testing
    if reference_photo and live_photo:
        return (True, 85, "Match found")
    return (False, 0, "Missing photo")

def process_verification_result(is_match, confidence):
    """Process AI result and determine status"""
    if is_match and confidence >= 60:
        return "present"
    elif is_match and confidence < 60:
        return "pending"
    else:
        return "violation"

def check_face_count(detection_result):
    """Check how many faces in photo"""
    if detection_result['face_count'] == 0:
        return (False, "No face detected")
    elif detection_result['face_count'] > 1:
        return (False, "Multiple faces detected")
    return (True, "OK")

# ============================================
# TESTS
# ============================================

class TestVerificationResultProcessing:
    
    def test_high_confidence_match(self):
        result = process_verification_result(is_match=True, confidence=95)
        assert result == "present"
    
    def test_low_confidence_match(self):
        result = process_verification_result(is_match=True, confidence=55)
        assert result == "pending"
    
    def test_no_match(self):
        result = process_verification_result(is_match=False, confidence=30)
        assert result == "violation"
    
    def test_boundary_confidence(self):
        result = process_verification_result(is_match=True, confidence=60)
        assert result == "present"


class TestFaceCount:
    
    def test_single_face(self):
        detection = {'face_count': 1}
        success, message = check_face_count(detection)
        assert success == True
        assert message == "OK"
    
    def test_no_face(self):
        detection = {'face_count': 0}
        success, message = check_face_count(detection)
        assert success == False
        assert "No face" in message
    
    def test_multiple_faces(self):
        detection = {'face_count': 3}
        success, message = check_face_count(detection)
        assert success == False
        assert "Multiple" in message


class TestMLServiceWrapper:
    
    def test_successful_verification(self):
        result = verify_student_face("ref.jpg", "live.jpg")
        is_match, confidence, message = result
        assert is_match == True
        assert confidence > 0
    
    def test_missing_photo(self):
        result = verify_student_face(None, "live.jpg")
        is_match, confidence, message = result
        assert is_match == False
    
    def test_full_flow_present(self):
        # Simulate full verification flow
        is_match, confidence, _ = verify_student_face("ref.jpg", "live.jpg")
        status = process_verification_result(is_match, confidence)
        assert status == "present"
