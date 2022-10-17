package com.example.demo.dto;

import java.util.HashSet;
import java.util.Set;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import com.example.demo.entity.Profile;
import com.example.demo.utils.Constant;

public class UserDTO {
	
	private Integer id;
	
	private String nif;
	
	
	private String name;
	
	
	private String surname;
	
	
	private String address;
	
	
	private String city;
	
	@NotEmpty(message = Constant.USER_EMAIL_REQUIRED)
	@Email(message= Constant.EMAIL_INVALID)
	private String email;
	
	
	private Integer phone;

	
	private String zip;
	
	@NotEmpty(message = Constant.LOGIN_REQUIRED)
	private String login;
	
	@NotEmpty(message = Constant.USER_PASSWORD_REQUIRED)
	private String password;
	
	
	private String fullName;
	
	
	private Set<ProfileDTO> profiles = new HashSet<>();
	

	public UserDTO() {
		super();
	}
	
	
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getNif() {
		return nif;
	}

	public void setNif(String nif) {
		this.nif = nif;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getSurname() {
		return surname;
	}

	public void setSurname(String surname) {
		this.surname = surname;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Integer getPhone() {
		return phone;
	}

	public void setPhone(Integer phone) {
		this.phone = phone;
	}

	public String getZip() {
		return zip;
	}

	public void setZip(String zip) {
		this.zip = zip;
	}

	public String getLogin() {
		return login;
	}

	public void setLogin(String login) {
		this.login = login;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public Set<ProfileDTO> getProfiles() {
		return profiles;
	}

	public void setProfiles(Set<ProfileDTO> profiles) {
		this.profiles = profiles;
	}


	
	
}
