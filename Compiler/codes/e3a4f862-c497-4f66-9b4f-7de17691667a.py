t = int(input())
for _ in range(t):
    n = int(input())
    h = list(map(int, input().split()))
    dp = [0] * (n + 1)

    for i in range(1, n + 1):  # total chocolates from 1 to n
        for j in range(1, i + 1):  # try every possible chunk size
            dp[i] = max(dp[i], dp[i - j] + h[j - 1])

    print(dp[n])