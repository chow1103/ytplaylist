export function objURLParams(obj) {
  const searchParams = new URLSearchParams();
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      for (const val of obj[key]) {
        searchParams.append(key, val);
      }
    } else {
      searchParams.append(key, obj[key]);
    }
  }
  return searchParams;
}

export function concatJSON(obj1, obj2, targets) {
  // Make a shallow copy of obj1
  const combinedJson = { ...obj1 };

  if (!Array.isArray(targets)) {
    // Extract targeted array from both objects
    const arr1 = obj1[targets] || [];
    const arr2 = obj2[targets] || [];

    // Update combinedJson with new concatenated array
    combinedJson[targets] = arr1.concat(arr2);

    return combinedJson;
  } else {
    for (const target of targets) {
      const arr1 = obj1[target] || [];
      const arr2 = obj2[target] || [];

      combinedJson[target] = arr1.concat(arr2);
    }
  }

  return combinedJson;
}
