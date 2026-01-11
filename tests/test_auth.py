import pytest

# ============================================
# VALIDATION FUNCTIONS
# ============================================
def is_valid_student_id(student_id):
    """Check if student ID is valid"""
    if not student_id:
        return False
    if len(student_id) != 9:
        return False
    if not student_id.isdigit():
        return False
    return True

def is_valid_role(role):
    """Check if role is valid"""
    valid_roles = ['student', 'proctor', 'admin']
    return role in valid_roles

def validate_login_input(username, password, role):
    """Validate login inputs"""
    errors = []
    if not username:
        errors.append("Username is required")
    if not password:
        errors.append("Password is required")
    if not is_valid_role(role):
        errors.append("Invalid role")
    return errors

# ============================================
# TESTS
# ============================================

class TestStudentIdValidation:
    
    def test_valid_student_id(self):
        assert is_valid_student_id("220706001") == True
        assert is_valid_student_id("220704015") == True
    
    def test_empty_student_id(self):
        assert is_valid_student_id("") == False
        assert is_valid_student_id(None) == False
    
    def test_wrong_length(self):
        assert is_valid_student_id("12345") == False
        assert is_valid_student_id("12345678901") == False
    
    def test_non_digit_characters(self):
        assert is_valid_student_id("22070600A") == False
        assert is_valid_student_id("abcdefghi") == False


class TestRoleValidation:
    
    def test_valid_roles(self):
        assert is_valid_role("student") == True
        assert is_valid_role("proctor") == True
        assert is_valid_role("admin") == True
    
    def test_invalid_roles(self):
        assert is_valid_role("teacher") == False
        assert is_valid_role("") == False
        assert is_valid_role(None) == False


class TestLoginValidation:
    
    def test_valid_input(self):
        errors = validate_login_input("220706001", "123456", "student")
        assert errors == []
    
    def test_empty_username(self):
        errors = validate_login_input("", "123456", "student")
        assert "Username is required" in errors
    
    def test_empty_password(self):
        errors = validate_login_input("220706001", "", "student")
        assert "Password is required" in errors
    
    def test_invalid_role(self):
        errors = validate_login_input("220706001", "123456", "hacker")
        assert "Invalid role" in errors
    
    def test_all_fields_empty(self):
        errors = validate_login_input("", "", "invalid")
        assert len(errors) == 3
