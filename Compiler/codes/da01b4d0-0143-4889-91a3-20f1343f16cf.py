def two_sum(nums, target):
    num_to_index = {}  # maps number → index
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_to_index:
            return [num_to_index[complement], i]
        num_to_index[num] = i

# Example usage with input
nums = list(map(int, input().split()))
target = int(input())
print(two_sum(nums, target))
