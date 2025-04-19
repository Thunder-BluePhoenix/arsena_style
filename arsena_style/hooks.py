app_name = "arsena_style"
app_title = "Arsena Style"
app_publisher = "Phoenix"
app_description = "Arsena"
app_email = "bluephoenix995@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "arsena_style",
# 		"logo": "/assets/arsena_style/logo.png",
# 		"title": "Arsena Style",
# 		"route": "/arsena_style",
# 		"has_permission": "arsena_style.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/arsena_style/css/arsena_style.css"
app_include_js = "/assets/arsena_style/js/barcode_navbarsrt.js"

# include js, css files in header of web template
# web_include_css = "/assets/arsena_style/css/arsena_style.css"
# web_include_js = "/assets/arsena_style/js/arsena_style.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "arsena_style/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {"Work Order" : "public/js/workorder.js",
              "BOM": "public/js/bom.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "arsena_style/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "arsena_style.utils.jinja_methods",
# 	"filters": "arsena_style.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "arsena_style.install.before_install"
# after_install = "arsena_style.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "arsena_style.uninstall.before_uninstall"
# after_uninstall = "arsena_style.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "arsena_style.utils.before_app_install"
# after_app_install = "arsena_style.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "arsena_style.utils.before_app_uninstall"
# after_app_uninstall = "arsena_style.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "arsena_style.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events
doc_events = {
    "Work Order": {"before_save":"arsena_style.arsena_style.methods.workorder.before_save_wo"},
    "BOM": {"on_submit":"arsena_style.arsena_style.methods.bom.create_pps"},
    "Stock Entry":{"on_submit":"arsena_style.arsena_style.methods.stock_entry.create_fp"}
}

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"arsena_style.tasks.all"
# 	],
# 	"daily": [
# 		"arsena_style.tasks.daily"
# 	],
# 	"hourly": [
# 		"arsena_style.tasks.hourly"
# 	],
# 	"weekly": [
# 		"arsena_style.tasks.weekly"
# 	],
# 	"monthly": [
# 		"arsena_style.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "arsena_style.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "arsena_style.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "arsena_style.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["arsena_style.utils.before_request"]
# after_request = ["arsena_style.utils.after_request"]

# Job Events
# ----------
# before_job = ["arsena_style.utils.before_job"]
# after_job = ["arsena_style.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"arsena_style.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

