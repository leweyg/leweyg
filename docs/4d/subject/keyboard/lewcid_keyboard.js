
var LEWCID_KEYBOARD = {
    "LOCATION":{
        "char":{count:1,mod:1},
        "col":{pack:70,mod:1},
        "line":{pack:5,mod:70},
        "SHFT":{pack:140,mod:350},
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
        "x":{pack:1,mod:8},
        "y":{pack:8,mod:16},
        "char":{pack:(8*16),mod:256},
    },
    "percepts":"*(font_array_8x16x256)",
};

var LEWCID_CONSOLE_BUFFER = {
    "concepts":{
        "all":{count:(12*2)},
        "char":{count:1},
        "x":{pack:1,mod:12},  // index%12
        "y":{pack:12,mod:2}, // (index/12)%2
    },
    "percepts":"Hello World.New Line."
};

/*
LEWCID_FONT( char=LEWCID_CONSOLE_BUFFER ) == {
    "concepts":{
        "all":{count:786432},
        "opacity":{count:1,mod:1,min:0,max:1},
        "x":{pack:1,mod:96},
        "y":{pack:1536,mod:512},
    },
    "percepts":{

    },
};

perceptions( LEWCID_KEYBOARD )

concept_reduce( LEWCID_KEYBOARD, LEWCID_FONT );

*/


var LEWCID_OPACITY_BUFFER = {
    "concepts":{
        "all":(8*16*12*2),
        "x":{pack:1,mod:(8*12)},
        "y":{pack:(8*12),mod:(16*2)},
        "opacity":{
            count:1,mod:1, min:0, max:1,
            value:(
                0//LEWCID_FONT(char=LEWCID_CONSOLE_BUFFER(X/8,Y/16).char)
            ),
        },
    },
    "process":{},
};

// dimension attributes:
//
//  var address = ( ( ( ( index + pre_offset ) / pack ) % mod ) + post_offset );
//  if (count)
//    return percepts[ address ... (address + count) ]
//  else
//    return address

function idea_concept_by_index(idea,concept,index) {
    var address = index;
    if (concept.pack)
        address /= concept.pack;
    if (concept.mod)
        address %= concept.mod;
    if (concept.count) {
        return idea.percepts[ address ];
    } else {
        return address;
    }
}

function foreach_percept(idea,cb=null,into={}) {
    var index_max = idea.percepts.length;
    var dims = idea.concepts;
    for (var index=0; index<index_max; index++) {
        for (var concept_id in dims) {
            var concept = dims[concept_id];
            var value = idea_concept_by_index(idea, concept, index );
            into[concept_id] = value;
        }
        if (cb) cb(into,index);
    }
}

function canvas_ideas_draw_percepts() {
    
}