
export async function asyncForEach(array, callBack) {
  for (var i = 0; i < array.length; i += 1) {
    await callBack(array[i], i, array); //eslint-disable-line
  }
}

export function getProductLoadValue(pod, productName) {
  // If product not found return 0
  if (!pod.products.find(prod => prod.name === productName)) return 0;
  return (pod.productType.includes(productName) || pod.productType.includes('All')) ? pod.products.find(prod => prod.name === productName).loadValue : 0;
}

export function getPercentLoad(pod) {
  var percentLoad = (pod.currentPodLoad * 100) / pod.podLoadTolerance;
  return (percentLoad) ? Math.round(percentLoad) : 0;
}
