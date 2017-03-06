import unittest
import getInfo

class function_Test(unittest.TestCase):
    def test_not_image(self):
        response = getInfo.isImage('http://hello.img')
        self.assertEquals(response, False)
    def test_png_image(self):
        response = getInfo.isImage('http://something.png')
        self.assertEquals(response, True)
    def test_jpg_image(self):
        response = getInfo.isImage('http://other.jpg')
        self.assertEquals(response, True)
    def test_jpeg_image(self):
        response = getInfo.isImage('http://something.jpeg')
        self.assertEquals(response, True)
    def test_gif_image(self):
        response = getInfo.isImage('http://other.jpg')
        self.assertEquals(response, True)
    def test_is_Text(self):
        response = getInfo.isImage('hello')
        self.assertEquals(response, False)
    def test_is_not_URL(self):
        response = getInfo.isUrl('hello.com')
        self.assertEquals(response, False)
    def test_URL_http(self):
        response = getInfo.isUrl('http://google.com')
        self.assertEquals(response, True)
    def test_is_URL_https(self):
        response = getInfo.isUrl('https://hello.com')
        self.assertEquals(response, True)
    def test_command_about(self):
        response = getInfo.chatBotMessage("!! about")
        self.assertEquals(response,"This room is for authorized potatos only")
    def test_command_find(self):
        response = getInfo.chatBotMessage("!! find")
        self.assertEquals(response,"!! find")
    def test_command_help(self):
        response = getInfo.chatBotMessage("!! help")
        self.assertEquals(response,"!! about -gives description of room !! help -gives all commands of the room !! say <something> -makes me say <something> !! chatBot <something> -say something to chatterbot !! smile -to make the bot a little happier !! find <zipcode> find concerts in the zipcode area !! rock on makes bot rock")
    def test_command_say(self):
        response = getInfo.chatBotMessage("!! say something")
        self.assertEquals(response,"something")
    def test_command_chatBot(self):
        response = getInfo.chatBotMessage("!! chatBot hello")
        self.assertEquals(response,"!! chatBot hello")
    def test_command_notFound(self):
        response = getInfo.chatBotMessage("!! hello is someone")
        self.assertEquals(response,"Sorry I didn't get that")

if __name__ == '__main__':
    unittest.main()