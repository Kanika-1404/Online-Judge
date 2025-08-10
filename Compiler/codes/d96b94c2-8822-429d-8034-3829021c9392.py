#include <iostream>
#include <climits> // For INT_MIN and INT_MAX
using namespace std;

int reverse(int x) {
    int sign = (x < 0) ? -1 : 1;
    long x_abs = abs((long)x); // use long to avoid abs overflow for INT_MIN

    long reversed_num = 0;
    while (x_abs != 0) {
        int digit = x_abs % 10;
        x_abs /= 10;

        // Check for overflow before adding the digit
        if (reversed_num > INT_MAX / 10 || (reversed_num == INT_MAX / 10 && digit > 7)) {
            return 0;
        }

        reversed_num = reversed_num * 10 + digit;
    }

    return (int)(sign * reversed_num);
}

int main() {
    int x;
    if (!(cin >> x)) {
        cout << "Invalid input! Please enter a valid integer." << endl;
        return 0;
    }

    cout << reverse(x) << endl;
    return 0;
}
