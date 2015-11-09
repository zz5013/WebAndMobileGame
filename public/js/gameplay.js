var renderer = PIXI.autoDetectRenderer(1200, 800,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

// size of the actuall game size
var map_size = 5;
var map = [];
for(var i = 0; i<map_size*map_size; i++){
    map[i] = null;
}

// tile size , depends on screen later
var tile_size = 80;
// where the first road begin
var zero_x = 80;
var zero_y = 60;

var selections_x = 500;
var selections_y = 0;

// create the root of the scene graph
var stage = new PIXI.Container();
// map base, put all tiles into one container
var MAP_STAGE = new PIXI.Container();

stage.addChild(MAP_STAGE);
// create background
for (var j = 0; j < map_size; j++) {
    for (var i = 0; i < map_size; i++) {
        var bg = PIXI.Sprite.fromImage('assets/background.png');
        bg.x = tile_size * i;
        bg.y = tile_size * j;
        bg.height = tile_size;
        bg.width = tile_size;
        MAP_STAGE.addChild(bg);
    };
};
MAP_STAGE.x = zero_x;
MAP_STAGE.y = zero_y;

// setting directions of road pieces according to image's default direction
// for detail and usage see the comments below
dir_dict = {'monster':[-1], 'corner':[0,3], 'end':[2], 'straight':[0,2], 't':[1,2,3], 'tree':[]};





// create road part from image, can be dragged to fit on map,
// dir defines where it points to that leads to another road,
// 0 is north, 1 is east, 2 is south, 3 is west, -1 is hell :)
var road_monster = createMapParts(selections_x,selections_y,'assets/spt_monster.png',dir_dict['monster'],0);
var road_corner = createMapParts(selections_x,selections_y+tile_size*1.5,'assets/spt_road_corner.png',dir_dict['corner'],1);
var road_end = createMapParts(selections_x,selections_y+tile_size*3,'assets/spt_road_end.png',dir_dict['end'],0);
var road_straight = createMapParts(selections_x,selections_y+tile_size*4.5,'assets/spt_road_straight.png',dir_dict['straight'],0);
var road_t = createMapParts(selections_x,selections_y+tile_size*6,'assets/spt_road_t.png',dir_dict['t'],0);
var road_tree = createMapParts(selections_x,selections_y+tile_size*7.5,'assets/spt_tree.png',dir_dict['tree'],0); 



// create start button
start_button = createStartButton(180,550,'assets/spt_inst_start.png');

var player_tex = PIXI.Texture.fromImage('assets/spt_boy.png');
var player = new PIXI.Sprite(player_tex);
// position and size
player.x = 0;
player.y = 0;

player.aim_x = 0;
player.aim_y = 0;


player.width = tile_size;
player.height = tile_size;

// position on map, only descrete numbers
player.pos_x = 0;
player.pos_y = 0;
var player_dir = 1;
player.isWalking = false;

// used in main loop for moving on canvas
player.xmov = 0;
player.ymov = 0;
player.speed = tile_size/20;

MAP_STAGE.addChild(player);

animate();

function animate(){
  //show_msg(map);

    player.x += player.speed*Math.sign(player.xmov);
    player.y += player.speed*Math.sign(player.ymov);
    player.xmov = Math.sign(player.xmov) * (Math.abs(player.xmov)-player.speed);
    player.ymov = Math.sign(player.ymov) * (Math.abs(player.ymov)-player.speed);

    requestAnimationFrame(animate);
    renderer.render(stage);

    //when one step is finished
    if (step < (instructionsQueuePointer - 1) && player.isWalking == true && player.x == player.aim_x && player.y == player.aim_y && player.xmov == 0 && player.ymov == 0) {
    step ++;
    player_start();
  }
  
}

// used for turning road
function turn_dir(dir){
  res = [];
  for(var i = 0; i < dir.length; i++){
    if(dir[i]>=0){
      res[i] = dir[i]+1;
      res[i] %= 4;
    }
  }
  return res;
}

// used for printing message on screen
function show_msg(msg){
    var spinningText = new PIXI.Text(msg, { font: 'bold 60px Arial', fill: '#cc00ff', align: 'center', stroke: '#FFFFFF', strokeThickness: 6 });

    // setting the anchor point to 0.5 will center align the text... great for spinning!
    spinningText.anchor.set(0.5);
    spinningText.position.x = 310;
    spinningText.position.y = 200;
    stage.addChild(spinningText);
}

// checking for relative position om game map
function check_in_map(x,y){
    return x>=0 && x<map_size && y >=0 && y<map_size;
}

/* @dir is the direction player moves, 0 notrh and clockwise inc
*  first check whether the road player stands on has this dir
*  then check boundries  
*/
function player_move(dir){

  // get direction!
  var xmov = (2-dir)*dir%2;
  var ymov = (dir-1)*(1-dir%2);
  
  var cur = player.pos_y*map_size+player.pos_x;
  var dst = (player.pos_y+ymov)*map_size + player.pos_x+xmov;

  //opsite direction
  var op = (dir+2)%4;

  if(dst<map_size*map_size && map[cur].indexOf(dir)!=-1
    && map[dst].indexOf(op)!=-1){

    player.xmov = xmov*tile_size;
    player.ymov = ymov*tile_size;



    player.pos_x += xmov;
    player.pos_y += ymov;

  }

  player.aim_x += xmov*tile_size;
  player.aim_y += ymov*tile_size;

}

//-----------------------------------------------------------



var instructionsQueue = [];
for(var i = 0; i<map_size*map_size*2; i++){
    instructionsQueue[i] = -1;
}
var instructionsQueuePointer = 0;
var step = 0;

var INSTRUCT_STAGE = new PIXI.Container();

stage.addChild(INSTRUCT_STAGE);


var queue_x = 850;
var queue_y = 10;

INSTRUCT_STAGE.x = queue_x;
INSTRUCT_STAGE.y = queue_y;


undo_button = createUndoButton(700,410,'assets/undo.png');


reset_button = createResetButton(310,510,'assets/reset.png');

var turn_left = createInstructions(selections_x+200, 10,'assets/spt_inst_left.png');
var turn_right = createInstructions(selections_x+200, 60,'assets/spt_inst_right.png');
var move_forward = createInstructions(selections_x+200, 110,'assets/spt_inst_forward.png');
var repeat_time = createInstructions(selections_x+200, 160, 'assets/spt_inst_repeat_time.png');
var repeat_end = createInstructions(selections_x+200, 210, 'assets/spt_inst_repeat_end.png');
var if_instruct = createInstructions(selections_x+200, 260, 'assets/spt_inst_if.png');
var else_instruct = createInstructions(selections_x+200, 310, 'assets/spt_inst_else.png');
var if_end = createInstructions(selections_x+200, 360, 'assets/spt_inst_end.png');





