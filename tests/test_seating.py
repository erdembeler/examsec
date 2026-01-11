import pytest

# ============================================
# SEATING FUNCTIONS
# ============================================
def generate_seat_codes(rows, cols):
    """Generate seat codes (A-1, A-2, B-1, ...)"""
    seats = []
    for r in range(rows):
        for c in range(cols):
            seats.append(f"{chr(65 + r)}-{c + 1}")
    return seats

def assign_seats_random(students, seats):
    """Assign seats randomly"""
    import random
    shuffled = students.copy()
    random.shuffle(shuffled)
    
    assignments = {}
    for i, student in enumerate(shuffled):
        if i < len(seats):
            assignments[student] = seats[i]
    return assignments

def check_duplicate_seat(assignments):
    """Check if same seat assigned to multiple students"""
    seats_used = list(assignments.values())
    return len(seats_used) != len(set(seats_used))

def is_seat_available(seat_code, current_assignments):
    """Check if seat is available"""
    return seat_code not in current_assignments.values()

# ============================================
# TESTS
# ============================================

class TestSeatCodeGeneration:
    
    def test_3x4_grid(self):
        seats = generate_seat_codes(3, 4)
        assert len(seats) == 12
        assert seats[0] == "A-1"
        assert seats[3] == "A-4"
        assert seats[4] == "B-1"
        assert seats[11] == "C-4"
    
    def test_2x2_grid(self):
        seats = generate_seat_codes(2, 2)
        assert seats == ["A-1", "A-2", "B-1", "B-2"]
    
    def test_empty_grid(self):
        seats = generate_seat_codes(0, 0)
        assert seats == []


class TestSeatAssignment:
    
    def test_all_students_assigned(self):
        students = ["stu1", "stu2", "stu3"]
        seats = ["A-1", "A-2", "A-3", "A-4"]
        
        assignments = assign_seats_random(students, seats)
        
        assert len(assignments) == 3
        assert all(s in assignments for s in students)
    
    def test_more_students_than_seats(self):
        students = ["stu1", "stu2", "stu3", "stu4", "stu5"]
        seats = ["A-1", "A-2", "A-3"]
        
        assignments = assign_seats_random(students, seats)
        
        assert len(assignments) == 3
    
    def test_no_duplicate_seats(self):
        students = ["stu1", "stu2", "stu3", "stu4"]
        seats = ["A-1", "A-2", "B-1", "B-2"]
        
        assignments = assign_seats_random(students, seats)
        
        assert check_duplicate_seat(assignments) == False


class TestSeatAvailability:
    
    def test_available_seat(self):
        assignments = {"stu1": "A-1", "stu2": "A-2"}
        assert is_seat_available("B-1", assignments) == True
    
    def test_occupied_seat(self):
        assignments = {"stu1": "A-1", "stu2": "A-2"}
        assert is_seat_available("A-1", assignments) == False
