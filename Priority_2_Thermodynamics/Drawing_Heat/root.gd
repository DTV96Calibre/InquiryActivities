extends Node2D

# class member variables go here, for example:
# var a = 2
# var b = "textvar"
var clicking = false

func _input(ev):
# Mouse in viewport coordinates
	if (ev.type==InputEvent.MOUSE_BUTTON):
		clicking = !clicking
       #print("Mouse Click/Unclick at: ",ev.pos)
	elif (ev.type==InputEvent.MOUSE_MOTION):
		print("motion")
       #print("Mouse Motion at: ",ev.pos)

   # Print the size of the viewport

   #print("Viewport Resolution is: ",get_viewport_rect().size)

func _ready():
	# Called every time the node is added to the scene.
	# Initialization here
	set_process_input(true)