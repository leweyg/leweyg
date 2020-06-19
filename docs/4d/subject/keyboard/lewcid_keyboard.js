import { fileURLToPath } from "url";


var LEWCID_KEYBOARD = {

    "LOCATION":{
        "char":{COUNT:1,MIN:0,MAX:256,PACKING:1},
        "col":{COUNT:70,MIN:0,MAX:70,PACKING:1},
        "line":{COUNT:5,MIN:0,MAX:5,PACKING:70},
        "SHFT":{COUNT:2,MIN:0,MAX:2,PACKING:350},
        "X":{"TRANSFORM":{"col" :0.02618}},
        "Y":{"TRANSFORM":{"line":0.0714}},
        "Z":{"TRANSFORM":{"char":0.00039,"SHFT":0.0001}},
    },
    
    "CONTENT":"" +
"       `  1  2  3  4  5  6  7  8  9  0  -  =   <              N  /  *  -    \n"+     
"           q  w  e  r  t  y  u  i  o  p  [  ]  \              7  8  9  +    \n"+     
"       CAP  a  s  d  f  g  h  j  k  l  ;  '  #  ┘             4  5  6  _    \n"+    
"       SHFT  z  x  c  v  b  n  m  ,  .  /    SHFT      ↑      1  2  3       \n"+    
"       c  o  a  ________________________  a  o  c   ←  ↓  →     0   .  _    \n"+
"       ~  !  @  #  $  %  ^  &  *  (  )  _  +   >    I  H  U                 \n"+
"           Q  W  E  R  T  Y  U  I  O  P  {  }  |    D  E  D   7  8  9  +    \n"+    
"       CAP  A  S  D  F  G  H  J  K  L  :  \"  #  ┘             4  5  6  _    \n"+     
"       SHFT  Z  X  C  V  B  N  M  <  >  ?    SHFT      ↑      1  2  3       \n"+   
"       c  o  a  ________________________  a  o  c   ←  ↓  →     0   .  _    \n"+
    " ",
    
};

var LEWCID_FONT = {
    "concepts":{
        "all":{count:(8*16*256)},
        "opacity":{count:1,mod:1,  min:0,max:1},
        "X":{pack:1,mod:8},
        "Y":{pack:8,mod:16},
        "Z":{pack:(8*16),mod:256},
        "char":{equals:"Z"},
    },
    "percepts":"*(font_array_8x16x256)",
};

var LEWCID_CONSOLE_BUFFER = {
    "concepts":{
        "char":{count:1,mod:1},
        "X":{pack:1,mod:12},  // index%12
        "Y":{pack:12,mod:2}, // (index/12)%2
    },
    "percepts":"Hello World.New Line."
};

var LEWCID_OPACITY_BUFFER = {
    "concepts":{
        "all":(8*16*12*2),
        "opacity":{count:1,mod:1, min:0, max:1},
        "X":{pack:1,mod:(8*12)},
        "Y":{pack:(8*12),mod:(16*2)}
    },
    "percepts":[],
};

// dimension attributes:
//
//  var address = ( ( ( ( index + pre_offset ) / pack ) % mod ) + post_offset );
//  if (count)
//    return percepts[ address ... (address + count) ]
//  else
//    return address

