import app, unittest, flask_testing, requests,urllib2,requests,os

class ServerIntegrationTestCase(
 flask_testing.LiveServerTestCase):
 def create_app(self):
    return app.app
 def test_page_response(self):
    response = urllib2.urlopen(self.get_server_url())
    self.assertEqual(response.code, 200)
 def test_response(self):
    response = requests.get("https://api.seatgeek.com/2/events?client_id="+os.getenv("client_id")+"&geoip=true&range=20mi&sort=datetime_local.asc&taxonomies.name=concert&page=1&per_page=5")
    print response
    self.assertEqual(str(response), "<Response [200]>")
    
if __name__ == '__main__':
 unittest.main()