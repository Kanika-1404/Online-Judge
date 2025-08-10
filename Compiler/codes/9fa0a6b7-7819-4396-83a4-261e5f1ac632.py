def reverse(x: int) -> int:
    INT_MIN, INT_MAX = -2**31, 2**31 - 1

    sign = -1 if x < 0 else 1
    x_abs = abs(x)

    reversed_num = 0
    while x_abs != 0:
        digit = x_abs % 10
        x_abs //= 10

        # Check for 32-bit overflow
        if reversed_num > INT_MAX // 10 or (reversed_num == INT_MAX // 10 and digit > 7):
            return 0

        reversed_num = reversed_num * 10 + digit

    return sign * reversed_num

# ---- Main Program ----
try:
    x = int(input())
    result = reverse(x)
    print(result)
except ValueError:
    print("Invalid input! Please enter a valid integer.")