import pytest

# ============================================
# CHECK-IN FUNCTIONS
# ============================================
def can_check_in(exam, student_id, existing_checkins):
    """Check if student can perform check-in"""
    if not exam.get('is_active'):
        return (False, "Exam has ended")
    
    if student_id in existing_checkins:
        return (False, "Already checked in")
    
    return (True, "OK")

def get_student_status(enrollment):
    """Get student status from enrollment"""
    if enrollment is None:
        return "not_enrolled"
    return enrollment.get('status', 'absent')

# ============================================
# TESTS
# ============================================

class TestCheckInEligibility:
    
    def test_can_check_in(self):
        exam = {'id': 1, 'is_active': True}
        existing = ['stu2', 'stu3']
        
        success, message = can_check_in(exam, 'stu1', existing)
        
        assert success == True
    
    def test_exam_ended(self):
        exam = {'id': 1, 'is_active': False}
        existing = []
        
        success, message = can_check_in(exam, 'stu1', existing)
        
        assert success == False
        assert "ended" in message
    
    def test_duplicate_checkin(self):
        exam = {'id': 1, 'is_active': True}
        existing = ['stu1', 'stu2']
        
        success, message = can_check_in(exam, 'stu1', existing)
        
        assert success == False
        assert "Already" in message


class TestStudentStatus:
    
    def test_present_status(self):
        enrollment = {'student_id': 1, 'status': 'present'}
        assert get_student_status(enrollment) == "present"
    
    def test_absent_status(self):
        enrollment = {'student_id': 1, 'status': 'absent'}
        assert get_student_status(enrollment) == "absent"
    
    def test_not_enrolled(self):
        enrollment = None
        assert get_student_status(enrollment) == "not_enrolled"
