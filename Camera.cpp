#include "Camera.hpp"

namespace gps {

	//Camera constructor
	Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {


		this->cameraPosition = cameraPosition;
		this->cameraTarget = cameraTarget;
		this->cameraUpDirection = cameraUp;
		this->cameraFrontDirection = glm::normalize(cameraTarget - cameraPosition);
		this->cameraRightDirection = glm::cross(cameraFrontDirection, cameraUp);
		this->pitch = 0.0f;
		this->yaw = 0.0f;


	}

	//return the view matrix, using the glm::lookAt() function
	glm::mat4 Camera::getViewMatrix() {

		return glm::lookAt(cameraPosition, cameraTarget, cameraUpDirection);
	}

	//update the camera internal parameters following a camera move event
	void Camera::move(MOVE_DIRECTION direction, float speed) {

		if (direction == MOVE_RIGHT)
		{
			this->cameraPosition = this->cameraPosition + this->cameraRightDirection * speed;
			this->cameraTarget = this->cameraPosition + this->cameraFrontDirection * speed;
		}

		if (direction == MOVE_LEFT)
		{
			this->cameraPosition = this->cameraPosition - this->cameraRightDirection * speed;
			this->cameraTarget = this->cameraPosition + this->cameraFrontDirection * speed;

		}

		if (direction == MOVE_FORWARD)
		{
			this->cameraPosition = this->cameraPosition + this->cameraFrontDirection * speed;
			this->cameraTarget = this->cameraPosition + this->cameraFrontDirection * speed;
		}


		if (direction == MOVE_BACKWARD)
		{
			this->cameraPosition = this->cameraPosition - this->cameraFrontDirection * speed;
			this->cameraTarget = this->cameraPosition + this->cameraFrontDirection * speed;
		}


	}

	//update the camera internal parameters following a camera rotate event
	//yaw - camera rotation around the y axis
	//pitch - camera rotation around the x axis
	void Camera::rotate(float pitch, float yaw) {
		//TODO
		this->yaw += yaw;
		this->pitch += pitch;

		if (this->pitch > 89.0f)
		{
			this->pitch = 89.0f;
		}

		if (this->pitch < -89.0f)
		{
			this->pitch = -89.0f;
		}

		this->cameraTarget = glm::vec3(cameraPosition.x + sin(glm::radians(this->yaw)), cameraPosition.y - sin(glm::radians(this->pitch)), cameraPosition.z - cos(glm::radians(this->yaw)));

		this->cameraFrontDirection = glm::normalize(this->cameraTarget - this->cameraPosition);

		this->cameraRightDirection = glm::normalize(glm::cross(this->cameraFrontDirection, this->cameraUpDirection));


	}
}