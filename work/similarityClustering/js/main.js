var ruleMap = {'cls1': {}, 'cls2': {}};

var testXfeatures = ["sex=Female", "age=young"],
    testYfeatures = ["age=middle-aged", "sex=Male"];

var scatterView = d3.projectionView()
  .width(700)
  .height(700)
  .xFeatures(testXfeatures)
  .yFeatures(testYfeatures)

d3.select('#projectionView').datum(obsCoverage).call(scatterView); 

scatterView.update();

