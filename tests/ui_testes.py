import unittest
import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

class TaskManagerUITests(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        chrome_options = Options()
        if os.getenv('HEADLESS', 'false').lower() == 'true':
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        service = Service(ChromeDriverManager().install())
        cls.driver = webdriver.Chrome(service=service, options=chrome_options)
        cls.driver.implicitly_wait(10)
        cls.base_url = os.getenv('FRONTEND_URL', "http://localhost:3000")
    
    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
    
    def setUp(self):
        self.driver.get(self.base_url)
        self.driver.execute_script("localStorage.clear();")
        self.driver.refresh()
        time.sleep(1)
    
    def test_01_login_with_valid_credentials(self):
        """Test successful login with valid credentials"""
        self._fill_login_form("admin", "password")
        
        # Wait for successful login
        logout_button = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='logout-button']"))
        )
        
        self.assertTrue(logout_button.is_displayed())
        self.assertIn("Task Manager", self.driver.title)
    
    def test_02_login_with_invalid_credentials(self):
        """Test login failure with invalid credentials"""
        self._fill_login_form("admin", "wrongpassword")
        
        # Wait for error message
        error_element = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='login-error']"))
        )
        
        self.assertIn("Invalid credentials", error_element.text)
    
    def test_03_create_new_task(self):
        """Test creating a new task"""
        self._login()
        
        # Create new task
        title_input = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='new-task-title']")
        description_input = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='new-task-description']")
        create_button = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='create-task-button']")
        
        title_input.send_keys("UI Test Task")
        description_input.send_keys("Created by Selenium UI test")
        create_button.click()
        
        # Wait for task to appear
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//h4[text()='UI Test Task']"))
        )
        
        # Verify task count updated
        task_count = self.driver.find_element(By.XPATH, "//h3[contains(text(), 'Your Tasks')]")
        self.assertIn("3", task_count.text)  # Should show 3 tasks now
    
    def test_04_edit_task(self):
        """Test editing an existing task"""
        self._login()
        
        # Click edit button for first task
        edit_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid^='edit-task-']"))
        )
        edit_button.click()
        
        # Edit the title
        edit_title_input = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid^='edit-title-']"))
        )
        edit_title_input.clear()
        edit_title_input.send_keys("Updated Task Title")
        
        # Click Done button
        done_button = self.driver.find_element(By.CSS_SELECTOR, "[data-testid^='edit-task-']")
        done_button.click()
        
        # Verify update
        time.sleep(1)
        updated_task = self.driver.find_element(By.XPATH, "//h4[text()='Updated Task Title']")
        self.assertTrue(updated_task.is_displayed())
    
    def test_05_complete_task(self):
        """Test marking a task as completed"""
        self._login()
        
        # Find and click completion checkbox
        checkbox = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid^='task-completed-']"))
        )
        
        initial_state = checkbox.is_selected()
        checkbox.click()
        
        time.sleep(1)
        self.assertNotEqual(initial_state, checkbox.is_selected())
    
    def test_06_delete_task(self):
        """Test deleting a task"""
        self._login()
        
        # Get initial task count
        initial_tasks = len(self.driver.find_elements(By.CSS_SELECTOR, "[data-testid^='task-']"))
        
        # Find and click delete button
        delete_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid^='delete-task-']"))
        )
        delete_button.click()
        
        # Handle confirmation dialog
        time.sleep(0.5)
        self.driver.switch_to.alert.accept()
        
        # Wait and verify task count decreased
        time.sleep(2)
        final_tasks = len(self.driver.find_elements(By.CSS_SELECTOR, "[data-testid^='task-']"))
        self.assertLess(final_tasks, initial_tasks)
    
    def test_07_logout_functionality(self):
        """Test logout functionality"""
        self._login()
        
        # Click logout button
        logout_button = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='logout-button']")
        logout_button.click()
        
        # Verify redirect to login page
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='login-form']"))
        )
        
        login_form = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='login-form']")
        self.assertTrue(login_form.is_displayed())
    
    def _login(self):
        """Helper method to login"""
        self._fill_login_form("admin", "password")
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='logout-button']"))
        )
    
    def _fill_login_form(self, username, password):
        """Helper method to fill login form"""
        username_input = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='username-input']")
        password_input = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='password-input']")
        login_button = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='login-button']")
        
        username_input.clear()
        password_input.clear()
        username_input.send_keys(username)
        password_input.send_keys(password)
        login_button.click()

if __name__ == "__main__":
    unittest.main(verbosity=2)
