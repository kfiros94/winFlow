package com.winflow.winflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WinflowApplication {

	public static void main(String[] args) {
		SpringApplication.run(WinflowApplication.class, args);
	}

}
