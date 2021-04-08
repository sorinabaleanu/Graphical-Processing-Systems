#version 410 core

in vec3 fNormal;
in vec4 fPosEye;
in vec2 fTexCoords;
in vec4 lightCoord;

out vec4 fColor;

//lighting
uniform	vec3 lightDir;
uniform	vec3 lightColor;
uniform float pinkLight=0.0f;

uniform float fogEffect =0.0f;

uniform float night =0.0f;

//texture
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;
uniform sampler2D shadowMap;

in vec4 fragPosLightSpace;

vec3 normalEye;

vec3 ambient;
vec3 diffuse;
vec3 specular;

vec3 newAmbient;
vec3 newDiffuse;
vec3 newSpecular;

float ambientStrength = 0.2f;
float specularStrength = 0.5f;
float shininess = 32.0f;

float shadow;

//punctiform light
float constant = 1.0f;
float linear = 0.09f;
float quadratic = 0.32f;
float specCoeff;

float computeShadow()
{
	// perform perspective divide
	vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
	normalizedCoords = normalizedCoords * 0.5 + 0.5;
	if (normalizedCoords.z > 1.0f)
		return 0.0f;
	float closestDepth = texture(shadowMap, normalizedCoords.xy).r;
	float currentDepth = normalizedCoords.z;
	float bias = 0.005f;
	float shadow = currentDepth - bias > closestDepth ? 1.0f : 0.0f;
	
	return shadow;
}

void computeLightComponents()
{		
	vec3 cameraPosEye = vec3(0.0f);//in eye coordinates, the viewer is situated at the origin
	
	//transform normal
	normalEye = normalize(fNormal);	
	
	//compute light direction
	vec3 lightDirN = normalize(lightDir);
	
	//compute view direction 
	vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
		
	//compute ambient light
	ambient = ambientStrength * lightColor;
	
	//compute diffuse light
	diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
	
	//compute specular light
	vec3 reflection = reflect(-lightDirN, normalEye);
	specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
	specular = specularStrength * specCoeff * lightColor;
}
float computeFog()
{
 float fogDensity = 0.05f;
 float fragmentDistance = length(fPosEye);
 float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));

 return clamp(fogFactor, 0.0f, 1.0f);
}

float attCompute()
{
	float distance = length(lightCoord-fragPosLightSpace);
	float attenuation = 1.0f/(constant+linear*distance+quadratic*(distance*distance));
	return attenuation;
}

void main() 
{
	computeLightComponents();
	
	vec3 specColor = vec3(1.0f,0.7f,0.7f);

	ambient *= texture(diffuseTexture, fTexCoords).rgb;
	diffuse *= texture(diffuseTexture, fTexCoords).rgb;
	specular *= texture(specularTexture, fTexCoords).rgb;
	
	float att = attCompute();
	newAmbient = att*ambientStrength*specColor;
	newDiffuse = att*max(dot(normalEye ,normalize(lightCoord.xyz-fragPosLightSpace.xyz)),0.0f)*specColor;
	newSpecular = att *specularStrength*specCoeff*specColor;

	if(pinkLight == 1.0f){
		ambient += newAmbient;
		diffuse += newDiffuse;
		specular += newSpecular;
	}


	//modulate with shadow
	shadow = computeShadow();
	vec3 color = min((ambient + (1.0f - shadow)*diffuse) + (1.0f - shadow)*specular, 1.0f);
    vec4 color1 = vec4(color,1.0f);

	fColor = vec4(color, 1.0f);
	

	if(fogEffect == 1.0f){
		float fogFactor = computeFog();
		vec4 fogColor = vec4(0.5f, 0.5f, 0.5f,0.1f);
		fColor = mix(fogColor, color1, fogFactor);
	}

	
	
}
