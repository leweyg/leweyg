var viralSlide0 = {
  "Name":"ElFor:PanelService",
  "OutputScope":{
    "Vector":[{
      "Id":"x",
      "Scope":{
        "From":0,
        "To":1},
      "Resolution":{
        "Count":30},
      "Inputs":[{
        "Id":"x",
        "Weight":2.97631},{
        "Id":"y",
        "Weight":0},{
        "Id":"z",
        "Weight":0},{
        "Id":"one",
        "Weight":-1.62}]},{
      "Id":"y",
      "Scope":{
        "From":0,
        "To":1},
      "Resolution":{
        "Count":19},
      "Inputs":[{
        "Id":"x",
        "Weight":0},{
        "Id":"y",
        "Weight":1.93091},{
        "Id":"z",
        "Weight":0},{
        "Id":"one",
        "Weight":-0.84}]},{
      "Id":"z",
      "Scope":{
        "From":0,
        "To":1},
      "Resolution":{
        "Count":15},
      "Inputs":[{
        "Id":"x",
        "Weight":0},{
        "Id":"y",
        "Weight":0},{
        "Id":"z",
        "Weight":1.46743},{
        "Id":"one",
        "Weight":-1.22}]}]},
  "ContentRevision":4,
  "Elements":[
          {
    "Name":"LayEl[mainHolder]",
    "OutputScope":{
      "Vector":[{
        "Id":"x",
        "Resolution":{
          "Count":30},
        "Inputs":[{
          "Id":"one",
          "Weight":0},{
          "Id":"x",
          "Weight":1}]},{
        "Id":"y",
        "Resolution":{
          "Count":17},
        "Inputs":[{
          "Id":"one",
          "Weight":0.05263159},{
          "Id":"y",
          "Weight":0.8947368}]},{
        "Id":"z",
        "Resolution":{
          "Count":15},
        "Inputs":[{
          "Id":"one",
          "Weight":0},{
          "Id":"z",
          "Weight":1}]}]},
    "ContentRevision":2,
    "Shape":{
      "Scope":{
        "Vector":[{
          "Id":"x"},{
          "Id":"y"},{
          "Id":"z"},{
          "Id":"i",
          "IsPacking":true,
          "Resolution":{
            "Count":32}}],
        "Packing":{
          "VertexWidth":3,
          "VertexCount":32,
          "FrameCount":1}},
      "PackedUnitVertices":[0,0,0,1,0,0,0,1,0,1,1,0,0,0,1,1,0,1,0,1,1,1,1,1,0.07294901,0,0,0.927051,0,0,0.07294901,1,0,0.927051,1,0,0.07294901,0,1,0.927051,0,1,0.07294901,1,1,0.927051,1,1,0,0.07294901,0,1,0.07294901,0,0,0.927051,0,1,0.927051,0,0,0.07294901,1,1,0.07294901,1,0,0.927051,1,1,0.927051,1,0,0,0.07294901,1,0,0.07294901,0,1,0.07294901,1,1,0.07294901,0,0,0.927051,1,0,0.927051,0,1,0.927051,1,1,0.927051],
      "IndexSets":[{
        "IndexType":'Lines',
        "IndexWidth":2,
        "Weight":1,
        "Indices":[0,8,0,16,0,24,1,9,1,17,1,25,2,10,2,18,2,26,3,11,3,19,3,27,4,12,4,20,4,28,5,13,5,21,5,29,6,14,6,22,6,30,7,15,7,23,7,31]}]}},{
    "Name":"LayEl[mainGraph]",
    "OutputScope":{
      "Vector":[{
        "Id":"x",
        "Resolution":{
          "Count":30},
        "Inputs":[{
          "Id":"one",
          "Weight":0},{
          "Id":"x",
          "Weight":1}]},{
        "Id":"y",
        "Resolution":{
          "Count":17},
        "Inputs":[{
          "Id":"one",
          "Weight":0.05263159},{
          "Id":"y",
          "Weight":0.8947368}]},{
        "Id":"z",
        "Resolution":{
          "Count":15},
        "Inputs":[{
          "Id":"one",
          "Weight":0},{
          "Id":"z",
          "Weight":1}]}]},
    "ContentRevision":3,
    "Shape":{
      "Scope":{
        "Vector":[{
          "Id":"x",
          "IsPacking":true,
          "Resolution":{
            "Count":2}},{
          "Id":"y",
          "IsPacking":true,
          "Resolution":{
            "Count":2}},{
          "Id":"z",
          "IsPacking":true,
          "Resolution":{
            "Count":2}}],
        "Packing":{
          "VertexWidth":0,
          "VertexCount":8,
          "FrameCount":1}},
      "PackedUnitVertices":[],
      "IndexSets":[{
        "IndexType":'Lines',
        "IndexWidth":2,
        "Weight":1,
        "Indices":[]}]},
    "Elements":[{
      "OutputScope":{
        "Vector":[{
          "Id":"x",
          "Inputs":[{
            "Id":"x",
            "Weight":1}]},{
          "Id":"y",
          "Inputs":[{
            "Id":"y",
            "Weight":1}]},{
          "Id":"z",
          "Inputs":[{
            "Id":"z",
            "Weight":1}]}]},
      "ContentRevision":1,
      "Elements":[{
        "Name":"Scroller",
        "InputScope":{
          "Vector":[{
            "Id":"x",
            "Scope":{
              "From":0,
              "To":1},
            "Inputs":[{
              "Id":"x",
              "Weight":1},{
              "Id":"one",
              "Weight":0}]},{
            "Id":"y",
            "Scope":{
              "From":0,
              "To":1},
            "Inputs":[{
              "Id":"y",
              "Weight":1},{
              "Id":"one",
              "Weight":0}]},{
            "Id":"z",
            "Scope":{
              "From":0,
              "To":1},
            "Inputs":[{
              "Id":"z",
              "Weight":1},{
              "Id":"one",
              "Weight":0}]}]},
        "Options":{
          "Strings":{"extension":"viral_scroll_user"}},
        "ContentRevision":2,
        "Elements":[{
          "Name":"ScrolledModel",
          "Options":{
            "Strings":{"extension":"viral_model_user"}},
          "ContentRevision":2,
          "Elements":[{
            "ContentRevision":0,
            "Shape":{
              "Scope":{
                "Vector":[{
                  "Id":"x"},{
                  "Id":"y"},{
                  "Id":"z"},{
                  "Id":"i",
                  "IsPacking":true,
                  "Resolution":{
                    "Count":32}}],
                "Packing":{
                  "VertexWidth":3,
                  "VertexCount":32,
                  "FrameCount":1}},
              "PackedUnitVertices":[0,0,0,1,0,0,0,1,0,1,1,0,0,0,1,1,0,1,0,1,1,1,1,1,0.07294901,0,0,0.927051,0,0,0.07294901,1,0,0.927051,1,0,0.07294901,0,1,0.927051,0,1,0.07294901,1,1,0.927051,1,1,0,0.07294901,0,1,0.07294901,0,0,0.927051,0,1,0.927051,0,0,0.07294901,1,1,0.07294901,1,0,0.927051,1,1,0.927051,1,0,0,0.07294901,1,0,0.07294901,0,1,0.07294901,1,1,0.07294901,0,0,0.927051,1,0,0.927051,0,1,0.927051,1,1,0.927051],
              "IndexSets":[{
                "IndexType":'Lines',
                "IndexWidth":2,
                "Weight":1,
                "Indices":[0,8,0,16,0,24,1,9,1,17,1,25,2,10,2,18,2,26,3,11,3,19,3,27,4,12,4,20,4,28,5,13,5,21,5,29,6,14,6,22,6,30,7,15,7,23,7,31]}]}}]}]}]}]},{
    "Name":"LayEl='Next'",
    "OutputScope":{
      "Vector":[{
        "Id":"x",
        "Inputs":[{
          "Id":"one",
          "Weight":0},{
          "Id":"x",
          "Weight":0.1333333}]},{
        "Id":"y",
        "Inputs":[{
          "Id":"one",
          "Weight":-2.235174E-08},{
          "Id":"y",
          "Weight":0.05263158}]},{
        "Id":"z",
        "Inputs":[{
          "Id":"one",
          "Weight":0},{
          "Id":"z",
          "Weight":0.06666667}]}]},
    "ContentRevision":3,
    "Shape":{
      "Scope":{
        "Vector":[{
          "Id":"x",
          "IsPacking":true,
          "Resolution":{
            "Count":2}},{
          "Id":"y",
          "IsPacking":true,
          "Resolution":{
            "Count":2}},{
          "Id":"z",
          "IsPacking":true,
          "Resolution":{
            "Count":2}}],
        "Packing":{
          "VertexWidth":0,
          "VertexCount":8,
          "FrameCount":1}},
      "PackedUnitVertices":[],
      "IndexSets":[{
        "IndexType":'Lines',
        "IndexWidth":2,
        "Weight":1,
        "Indices":[]},{
        "IndexType":'Points',
        "IndexWidth":1,
        "Weight":0,
        "Options":{
          "Strings":{"scopeCollision":"true"}}}]},
    "Elements":[{
      "ContentRevision":0,
      "Shape":{
        "Scope":{
          "Vector":[{
            "Id":"x"},{
            "Id":"y"},{
            "Id":"z"},{
            "Id":"i",
            "IsPacking":true,
            "Resolution":{
              "Count":68}}],
          "Packing":{
            "VertexWidth":3,
            "VertexCount":68,
            "FrameCount":1}},
        "PackedUnitVertices":[0.04166667,0.9583334,0,0.04166667,0.08333334,0,0,0,0,0.04166667,0.9583334,0,0.1875,0.08333334,0,0,0,0,0.1875,0.9583334,0,0.1875,0.08333334,0,0.2604167,0.4166667,0,0.3854167,0.4166667,0,0.3854167,0.5,0,0.375,0.5833334,0,0.3645833,0.625,0,0.34375,0.6666667,0,0.3125,0.6666667,0,0.2916667,0.625,0,0.2708333,0.5416667,0,0.2604167,0.4166667,0,0.2604167,0.3333333,0,0.2708333,0.2083333,0,0.2916667,0.125,0,0.3125,0.08333334,0,0.34375,0.08333334,0,0.3645833,0.125,0,0.3854167,0.2083333,0,0.4479167,0.6666667,0,0.5625,0.08333334,0,0,0,0,0.5625,0.6666667,0,0.4479167,0.08333334,0,0.6458334,0.9583334,0,0.6458334,0.25,0,0.65625,0.125,0,0.6770834,0.08333334,0,0.6979167,0.08333334,0,0,0,0,0.6145834,0.6666667,0,0.6875,0.6666667,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        "IndexSets":[{
          "IndexType":'Lines',
          "IndexWidth":2,
          "Weight":1,
          "Indices":[0,1,0,0,0,0,3,4,0,0,0,0,6,7,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,25,26,0,0,0,0,28,29,30,31,31,32,32,33,33,34,0,0,0,0,36,37]}]}}]}]};